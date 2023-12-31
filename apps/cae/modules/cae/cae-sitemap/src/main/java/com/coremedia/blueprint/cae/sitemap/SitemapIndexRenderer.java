package com.coremedia.blueprint.cae.sitemap;


import com.coremedia.blueprint.base.links.UrlPrefixResolver;
import com.coremedia.cap.multisite.Site;
import edu.umd.cs.findbugs.annotations.NonNull;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileFilter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.zip.GZIPOutputStream;

import static org.apache.commons.text.StringEscapeUtils.escapeXml11;

class SitemapIndexRenderer extends AbstractSitemapRenderer {
  private static final Logger LOG = LoggerFactory.getLogger(SitemapIndexRenderer.class);

  private static final int SITEMAP_INDEX_MAX_ENTRIES = 50000;
  private static final int SITEMAP_INDEX_MAX_SIZE = 10485760;

  private final DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");

  private UrlPrefixResolver urlPrefixResolver;
  private SitemapHelper sitemapHelper;

  private int filenameIndex;
  private File targetDir;  // The base dir, configured internally
  private File outputDir;  // targetDir/siteId
  private File tmpDir; //targetDir/SiteId/sitemap.tmp, used for creation of the sitemap before replacing the old one.
  private String absoluteUrlPrefix;  // same as the site's url prefix, need it for the sitemap index entries

  // Delegate renderer for the sitemap fragment currently in progress
  private SitemapXmlRenderer sitemapXmlRenderer;


  // --- config -----------------------------------------------------

  public void setTargetDirectory(String targetDirectory) {
    try {
      targetDir = ensureWritableDir(new File(targetDirectory));
    } catch (IOException e) {
      throw new IllegalArgumentException("Bad target directory", e);
    }
  }

  public void setUrlPrefixResolver(UrlPrefixResolver urlPrefixResolver) {
    this.urlPrefixResolver = urlPrefixResolver;
  }

  public void setSitemapHelper(SitemapHelper sitemapHelper) {
    this.sitemapHelper = sitemapHelper;
  }


  // --- SitemapRenderer --------------------------------------------

  @Override
  public void setSite(Site site) {
    super.setSite(site);

    // If you cannot make sure the order of properties being set, switch to
    // the InitializingBean pattern.  Currently this is sufficient in the
    // package local context.
    if (targetDir==null || urlPrefixResolver==null || sitemapHelper==null) {
      throw new IllegalStateException("Must set site last.");
    }
    initTargetDomain();
    initOutputDir();
  }

  @Override
  public void startUrlList() {
    if (getSite()==null) {
      throw new IllegalStateException("Must set site before startUrlList.");
    }
    try {
      super.startUrlList();
      tmpDir = getSitemapTmpDir();
      backupSitemap();
      filenameIndex = 0;
      printOpening();
      sitemapXmlRenderer = new SitemapXmlRenderer(absoluteUrlPrefix);
      sitemapXmlRenderer.startUrlList();
    } catch (IOException e) {
      throw new IllegalStateException("Cannot create sitemap", e);
    }
  }

  /* Implementation note: This is invoked with a sitemap URL,
   * so it must just delegate to the current sitemap, but not call super.
   * The super method corresponds to an index entry and is invoked when
   * a sitemap is closed.
   */
  @Override
  public void appendUrl(String url) {
    try {
      newSitemapIfFull(url);
    } catch (IOException e) {
      throw new IllegalStateException("Cannot create sitemap", e);
    }
    try {
      sitemapXmlRenderer.appendUrl(url);
    } catch (Exception e) {
      LOG.warn("Cannot render sitemap url {}: {}, omit and continue.", url, e.getMessage());
    }
  }

  @Override
  public void endUrlList() {
    try {
      endCurrentSitemap();
      printClosing();
      super.endUrlList();
      writeSitemapIndexFile();
      replaceOldSitemap();
    } catch (IOException e) {
      try {
        deleteSitemap();
        FileUtils.forceDelete(tmpDir);
      } catch (IOException e1) {
        throw new IllegalStateException("Cannot create sitemap, and cannot even cleanup!", e);
      }
      throw new IllegalStateException("Cannot create sitemap", e);
    }
  }

  private void replaceOldSitemap() throws IOException{
    deleteSitemap();
    File[] files = listSitemapFiles(tmpDir);
    for (File file : files) {
      FileUtils.moveFileToDirectory(file, outputDir, false);
    }
    FileUtils.forceDelete(tmpDir);
  }

  @Override
  public String getResponse() {
    return "Sitemap has been written to " + outputDir + ", " + new Date() + "\n";
  }


  // --- internal ---------------------------------------------------

  private void initOutputDir() {
    try {
      outputDir = ensureWritableDir(new File(targetDir, getSite().getId()));
    } catch (IOException e) {
      throw new IllegalArgumentException("Cannot configure sitemap renderer", e);
    }
  }

  private void initTargetDomain() {
    String siteId = getSite().getId();
    absoluteUrlPrefix = urlPrefixResolver.getUrlPrefix(siteId, null, null);
    if (absoluteUrlPrefix==null) {
      throw new IllegalStateException("Cannot determine URL prefix for site " + siteId);
    }
  }

  /**
   * Check if the url can be appended to the current sitemap,
   * and eventually start a new sitemap.
   *
   * @param url next sitemap entry
   * @throws IOException
   */
  private void newSitemapIfFull(String url) throws IOException {
    if (!sitemapXmlRenderer.canAppend(url)) {
      // Sitemap is full, i.e. reached the limit of 10 MB or 50,000 URLs.
      // Finish the current sitemap and start a new one.
      endCurrentSitemap();
      if (currentCount()>=SITEMAP_INDEX_MAX_ENTRIES) {
        FileUtils.forceDelete(tmpDir);
        throw new IllegalStateException("Too many entries in sitemap index file. Abort.");
      }
      sitemapXmlRenderer = new SitemapXmlRenderer(absoluteUrlPrefix);
      sitemapXmlRenderer.startUrlList();
    }
  }

  /**
   * Write the sitemap file and the index entry.
   *
   * @throws IOException
   */
  private void endCurrentSitemap() throws IOException {
    sitemapXmlRenderer.endUrlList();
    if (!sitemapXmlRenderer.isEmpty()) {
      String sitemapFilename = writeSitemapFile();
      printIndexEntry(sitemapFilename);
      super.appendUrl(sitemapFilename);  // For the counter
    }
  }

  /**
   * Write the next sitemap file.
   *
   * @return  the name of the sitemap file
   * @throws IOException
   */
  private String writeSitemapFile() throws IOException {
    String sitemap = sitemapXmlRenderer.getResponse();
    File sitemapFile = new File(getSitemapTmpDir(), SitemapHelper.FILE_PREFIX + ++filenameIndex + ".xml.gz");
    try (OutputStream outputStream = new GZIPOutputStream(new FileOutputStream(sitemapFile))) {
      IOUtils.write(sitemap, outputStream, StandardCharsets.UTF_8);
    }
    return sitemapFile.getName();
  }

  /**
   * Write the sitemap index file.
   *
   * @throws IOException
   */
  private void writeSitemapIndexFile() throws IOException {
    String sitemapIndex = super.getResponse();
    File sitemapIndexFile = new File(getSitemapTmpDir(), SitemapHelper.SITEMAP_INDEX_FILENAME);
    try (OutputStream outputStream = new FileOutputStream(sitemapIndexFile)) {
      IOUtils.write(sitemapIndex, outputStream, StandardCharsets.UTF_8);
    }
    if (FileUtils.sizeOf(sitemapIndexFile)>SITEMAP_INDEX_MAX_SIZE) {
      FileUtils.forceDelete(getSitemapTmpDir());
      throw new IllegalStateException("Sitemap index would exceed 10MB, abort!");
    }
  }

  /**
   * @return The current dateTime in ISO8601 format
   */
  private String nowAsISO8601() {
    String simpleDate = dateFormat.format(new Date(System.currentTimeMillis()));
    int split = simpleDate.length() - 2;
    return simpleDate.substring(0, split) + ":" + simpleDate.substring(split);
  }


  // --- concrete syntax --------------------------------------------

  /**
   * Write the file header and opening &lt;sitemapindex&gt; tag to the result.
   */
  private void printOpening() {
    //NOSONAR : All the following Strings are not "magic".
    println("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");  //NOSONAR
    print("<!-- Generated: ");  //NOSONAR
    print(escapeXml11(new SimpleDateFormat().format(new Date())));
    println(" -->");  //NOSONAR
    println("<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");  //NOSONAR
  }

  /**
   * Write an index entry for the sitemap file into the result.
   *
   * @param sitemapFilename the filename of the sitemap
   */
  private void printIndexEntry(String sitemapFilename) {
    println("  <sitemap>");  //NOSONAR
    print("    <loc>");  //NOSONAR
    print(escapeXml11(sitemapHelper.sitemapIndexEntryUrl(getSite(), sitemapFilename)));
    println("</loc>");  //NOSONAR
    print("    <lastmod>");  //NOSONAR
    print(escapeXml11(nowAsISO8601()));
    println("</lastmod>");  //NOSONAR
    println("  </sitemap>");  //NOSONAR
  }

  /**
   * Print the closing of the sitemap index.
   */
  private void printClosing() {
    println("</sitemapindex>");  //NOSONAR
  }


  // --- file handling ----------------------------------------------

  private File ensureWritableDir(File file) throws IOException {
    if (file.exists()) {
      if (!file.isDirectory() || !file.canWrite()) {
        throw new IllegalArgumentException(file.getAbsolutePath() + " is not a directory or not writable");
      }
    } else {
      FileUtils.forceMkdir(file);
    }
    return file;
  }

  private void backupSitemap() throws IOException {
    File[] currentSitemapFiles = listSitemapFiles();
    // If there is no current sitemap, do nothing.
    // Do not even delete an older backup, it is still better than nothing.
    if (currentSitemapFiles.length>0) {
      File backup = new File(outputDir, SitemapHelper.FILE_PREFIX + ".bak");
      if (backup.exists()) {
        FileUtils.deleteDirectory(backup);
      }
      FileUtils.forceMkdir(backup);
      for (File file : currentSitemapFiles) {
        FileUtils.copyFileToDirectory(file, backup, false);
      }
    }
  }

  @NonNull
  private File getSitemapTmpDir() throws IOException {
    File sitemapTmpDir = new File(outputDir, SitemapHelper.FILE_PREFIX + ".tmp");
    if (sitemapTmpDir.exists()) {
      return sitemapTmpDir;
    }
    FileUtils.forceMkdir(sitemapTmpDir);
    return sitemapTmpDir;
  }

  private void deleteSitemap() throws IOException {
    for (File file : listSitemapFiles()) {
      FileUtils.forceDelete(file);
    }
  }

  @NonNull
  private File[] listSitemapFiles() throws IOException {
    if (outputDir ==null) {
      throw new IllegalStateException("Output dir not set");
    }
    return listSitemapFiles(outputDir);
  }

  @NonNull
  private File[] listSitemapFiles(@NonNull File folder) throws IOException {
    File[] files = folder.listFiles(new SitemapFileFilter());
    if (files == null) {
      throw new IOException("Bad target directory " + folder.getAbsolutePath());
    }
    return files;
  }

  /**
   * Accepts the sitemap files and the sitemap index files, but not the backup directory.
   */
  private static class SitemapFileFilter implements FileFilter {
    @Override
    public boolean accept(File pathname) {
      return pathname.isFile() && pathname.getName().startsWith(SitemapHelper.FILE_PREFIX);
    }
  }
}
