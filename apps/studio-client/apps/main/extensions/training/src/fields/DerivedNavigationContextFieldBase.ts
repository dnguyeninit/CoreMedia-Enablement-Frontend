import Config from "@jangaroo/runtime/Config";
import FieldContainer from "@jangaroo/ext-ts/form/FieldContainer";
import ValueExpression from "@coremedia/studio-client.client-core/data/ValueExpression";
import ValueExpressionFactory from "@coremedia/studio-client.client-core/data/ValueExpressionFactory";
import Content from "@coremedia/studio-client.cap-rest-client/content/Content";
import DerivedNavigationContextField from "./DerivedNavigationContextField";

class DerivedNavigationContextFieldBase extends FieldContainer {

  constructor(config: Config<FieldContainer> = null) {
    super(config);
  }

  /**
   * a private field that holds the selected navigation context
   */
  #selectionExpression:ValueExpression;

  /**
   * Getter for the field #selectionExpression, using lazy-initialization.
   *
   * The field #selectionExpression is initialized to an empty array on its first call.
   */
  protected getSelectionExpression():ValueExpression {
    if (!this.#selectionExpression) {
      this.#selectionExpression = ValueExpressionFactory.createFromValue([]);
    }
    return this.#selectionExpression;
  }

  /**
   * A helper function to find a content item with name "_folderProperties" within the folder hierarchy.
   *
   * This method is called recursively for a document and its parent folders, until a folder properties object is
   * found.
   *
   * @param content the document or one of its parent folders
   * @return content the folder properties object (or null)
   */
  protected findFolderProperties(content: Content): Content {
    if (!content) {
      // Emergency exit: if content is null, we have to stop.
      return undefined;
    }
    if (content.isDocument()) {
      // we continue with the parent folder of this content object
      let folder:Content = content.getParent();
      return this.findFolderProperties(folder);
    }
    // find a content object with name "_folderProperties" within the given content folder
    let folderProperties:Content = content.getChild("_folderProperties");
    if (folderProperties) {
      // success: this is the content we are looking for
      return folderProperties;
    }
    else {
      // we don't have a folderProperties object here, so we have to check the parent folder
      let parent:Content = content.getParent();
      return this.findFolderProperties(parent);
    }
  }

  /**
   * A value expression, that returns the FolderProperties content object for the current content.
   *
   * @param config
   * @return ValueExpression<Content>
   */
  protected getFolderPropertiesExpression(config: Config<DerivedNavigationContextField>): ValueExpression {
    return ValueExpressionFactory.createFromFunction(() => {
      let content:Content = config.bindTo.getValue() as Content;
      return this.findFolderProperties(content);
    });
  }

  /**
   * A value expression, that returns the contexts (array of Content) from the folder properties of the current
   * content object.
   *
   * @param config
   * @return ValueExpression<Array<Content>>
   */
  protected getDerivedContextExpression(config: Config<DerivedNavigationContextField>): ValueExpression {
    let folderPropertiesExpression:ValueExpression = this.getFolderPropertiesExpression(config);
    return folderPropertiesExpression.extendBy("properties", "contexts");
  }

}

export default DerivedNavigationContextFieldBase;
