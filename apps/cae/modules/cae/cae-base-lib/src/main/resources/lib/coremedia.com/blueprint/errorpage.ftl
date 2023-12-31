<#ftl strip_whitespace=true>

<#-- -------------------------------------------------------------------------------------------------------------------
 *
 * Please check the section "CoreMedia FreeMarker API" in chapter "Reference" in the "Frontend Developer Guide" for
 * details and examples for the following directives.
 * Any changes, additions or removals need to be documented in the manual.
 *
 ------------------------------------------------------------------------------------------------------------------- -->

<#--
 * Renders an error page.
 *
 * @param title Title of the error page
 * @param message Optional message to replace the default message
 * @param redirectUrl (optional) Optional redirection URL, must be HTML attribute escaped.
 * @nested (optional) nested content will be rendered inside the frame
 * PRIVATE -->
<#macro errorpage title message redirectUrl="/" language="en-US" icon="icon-compass">
  <#compress>
  <!DOCTYPE html>
  <html lang="${language}">
  <head>
    <meta charset="UTF-8">
    <title>${title!"CoreMedia CMS - Error"}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
      html {
        height: 100%;
        background-color: #252525;
        font-family: -apple-system, BlinkMacSystemFont,
        "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell",
        "Fira Sans", "Droid Sans", "Helvetica Neue",
        sans-serif;
      }

      body.cm-errors {
        box-sizing: border-box;
        height: 100%;
        padding: 10px;
        margin: 0;
      }

      @media (min-width: 768px) {
        body.cm-errors {
          padding: 40px 30px;
        }
      }

      .cm-errors__info {
        position: relative;
        height: 100%;
        box-sizing: border-box;
        background: #ffffff;
        min-height: 480px;
        max-height: 768px;
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
        color: #212121;
        border-radius: 2px;
      }

      .cm-errors__info .image_banner div {
        height: 100%;
      }

      .cm-errors__info .cm-errorbox {
        position: absolute;
        z-index: 1;
        width: 100%;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
      }

      .cm-errors__info .icon-compass {
        background: transparent url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='512'%20height='512'%20version='1'%3E%3Cpath%20d='M74.98%20437.02c99.975%2099.974%20262.065%2099.974%20362.04%200%2099.974-99.975%2099.974-262.065%200-362.04-99.975-99.974-262.065-99.974-362.04%200-99.974%2099.975-99.974%20262.065%200%20362.04zm24.992-24.992c-86.172-86.173-86.172-225.883%200-312.056%2086.173-86.172%20225.883-86.172%20312.056%200%2086.172%2086.173%2086.172%20225.883%200%20312.056-86.173%2086.172-225.883%2086.172-312.056%200zm24.97-13.347l169.86-103.878%20103.88-169.86-11.624-11.623-169.86%20103.878-103.88%20169.86%2011.624%2011.623z'/%3E%3C/svg%3E") no-repeat;
      }

      .cm-errors__info .icon-calendar {
        background: transparent url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201000%201000'%3E%3Cpath%20d='M249.5%20243.1h14c21.3%200%2038.6-17.3%2038.6-38.6V58.2c0-21.3-17.3-38.6-38.6-38.6h-14c-21.3%200-38.6%2017.3-38.6%2038.6v146.3c0%2021.3%2017.3%2038.6%2038.6%2038.6zM744.3%20242.1h14c21.3%200%2038.6-17.3%2038.6-38.6V57.2c0-21.3-17.3-38.6-38.6-38.6h-14c-21.3%200-38.6%2017.3-38.6%2038.6V203.5c0%2021.3%2017.3%2038.6%2038.6%2038.6z'/%3E%3Cpath%20d='M927.3%2098h-99v115.6c0%2038.6-31.4%2059.8-69.9%2059.8h-14c-38.6%200-69.9-31.4-69.9-69.9V98H333.4v106.5c0%2038.6-31.4%2069.9-69.9%2069.9h-14c-38.6%200-69.9-31.4-69.9-69.9V98H72.7C38.1%2098%2010%20126.2%2010%20160.7v757.9c0%2034.6%2028.1%2062.7%2062.7%2062.7h854.6c34.6%200%2062.7-28.1%2062.7-62.7V160.7c0-34.5-28.1-62.7-62.7-62.7zm0%20820.6H72.7V346.3h854.6v572.3z'/%3E%3Cpath%20d='M532.4%20538.3H645c4.5%200%208.1-3.6%208.1-8.1v-97.5c0-4.5-3.6-8.1-8.1-8.1H532.4c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.4%203.6%208.1%208.1%208.1zM716.2%20538.3h112.6c4.5%200%208.1-3.6%208.1-8.1v-97.5c0-4.5-3.6-8.1-8.1-8.1H716.2c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.4%203.6%208.1%208.1%208.1zM164.8%20697.9h112.6c4.5%200%208.1-3.6%208.1-8.1v-97.5c0-4.5-3.6-8.1-8.1-8.1H164.8c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.5%203.7%208.1%208.1%208.1zM348.6%20697.9h112.6c4.5%200%208.1-3.6%208.1-8.1v-97.5c0-4.5-3.6-8.1-8.1-8.1H348.6c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.5%203.6%208.1%208.1%208.1zM532.4%20697.9H645c4.5%200%208.1-3.6%208.1-8.1v-97.5c0-4.5-3.6-8.1-8.1-8.1H532.4c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.5%203.6%208.1%208.1%208.1zM716.2%20697.9h112.6c4.5%200%208.1-3.6%208.1-8.1v-97.5c0-4.5-3.6-8.1-8.1-8.1H716.2c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.5%203.6%208.1%208.1%208.1zM277.4%20743.9H164.8c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.5%203.6%208.1%208.1%208.1h112.6c4.5%200%208.1-3.6%208.1-8.1V752c0-4.5-3.6-8.1-8.1-8.1zM461.2%20743.9H348.6c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.5%203.6%208.1%208.1%208.1h112.6c4.5%200%208.1-3.6%208.1-8.1V752c0-4.5-3.6-8.1-8.1-8.1zM645%20743.9H532.4c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.5%203.6%208.1%208.1%208.1H645c4.5%200%208.1-3.6%208.1-8.1V752c0-4.5-3.6-8.1-8.1-8.1zM828.8%20743.9H716.2c-4.5%200-8.1%203.6-8.1%208.1v97.5c0%204.5%203.6%208.1%208.1%208.1h112.6c4.5%200%208.1-3.6%208.1-8.1V752c0-4.5-3.7-8.1-8.1-8.1z'/%3E%3C/svg%3E") no-repeat;
      }

      .cm-errors__info .cm-errorbox__icon {
        display: block;
        margin: 0 auto;
        width: 78px;
        height: 78px;
        background-size: 78px 78px;
      }

      @media (min-width: 768px) {
        .cm-errors__info .cm-errorbox__icon {
          width: 96px;
          height: 96px;
          background-size: 96px 96px;
        }
      }

      .cm-errors__info .cm-errorbox__message {
        font-size: 20px;
        line-height: 30px;
        margin: 30px 0 35px;
        font-weight: normal;
      }

      @media (min-width: 768px) {
        .cm-errors__info .cm-errorbox__message {
          font-size: 32px;
          margin: 40px 0 45px;
          line-height: 46px;
        }
      }

      .cm-errors__info .cm-errorbox__cause {
        font-size: 14px;
        line-height: 30px;
      }

      @media (min-width: 768px) {
        .cm-errors__info .cm-errorbox__cause {
          font-size: 20px;
        }
      }

      .cm-errors__info .cm-errorbox__cause br {
        display: none;
      }

      .cm-errors__info .cm-errorbox__back {
        width: 80%;
        max-width: 300px;
        margin: 40px auto;
        border: 3px solid #212121;
        text-transform: uppercase;
        font-size: 18px;
      }

      @media (min-width: 768px) {
        .cm-errors__info .cm-errorbox__back {
          width: 240px;
        }
      }

      .cm-errors__info .cm-errorbox__back a {
        color: #212121;
        text-decoration: none;
        padding: 15px 0;
        display: block;
        font-weight: normal;
        transition: all 0.3s ease;
      }

      .cm-errors__info .cm-errorbox__back a:hover {
        background: #212121;
        color: #ffffff;
        transition: all 0.3s ease;
      }
    </style>
    <@preview.previewScripts/>
  </head>
  <body class="cm-errors">
  <div class="cm-errors__info">
    <div class="cm-errorbox">
      <span class="cm-errorbox__icon ${icon}"></span>
      <div class="cm-errorbox__message">
      ${title!""}
      </div>
      <div class="cm-errorbox__cause">
      ${message!""}
      </div>
      <#nested>
      <#if redirectUrl?has_content>
        <div class="cm-errorbox__back">
          <a href="${redirectUrl}">Back to Homepage</a>
        </div>
      </#if>
    </div>
  </div>
  </body>
  </html>
  </#compress>
</#macro>
