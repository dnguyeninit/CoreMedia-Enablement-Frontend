import Config from "@jangaroo/runtime/Config";
import ConfigUtils from "@jangaroo/runtime/ConfigUtils";
import resourceManager from "@jangaroo/runtime/l10n/resourceManager";
import MenuSeparator from "@jangaroo/ext-ts/menu/Separator";
import AddItemsPlugin from "@coremedia/studio-client.ext.ui-components/plugins/AddItemsPlugin";
import StudioPlugin from "@coremedia/studio-client.main.editor-components/configuration/StudioPlugin";
import CopyResourceBundleProperties from "@coremedia/studio-client.main.editor-components/configuration/CopyResourceBundleProperties";
import TabbedDocumentFormDispatcher from "@coremedia/studio-client.main.editor-components/sdk/premular/TabbedDocumentFormDispatcher";
import AddTabbedDocumentFormsPlugin from "@coremedia/studio-client.main.editor-components/sdk/plugins/AddTabbedDocumentFormsPlugin";
import NewContentMenu from "@coremedia/studio-client.main.editor-components/sdk/newcontent/NewContentMenu";
import QuickCreateMenuItem from "@coremedia/studio-client.main.editor-components/sdk/quickcreate/QuickCreateMenuItem";
import ReferrerListPanel from "@coremedia/studio-client.main.editor-components/sdk/premular/ReferrerListPanel";
import CMArticleSystemForm from "@coremedia-blueprint/studio-client.main.blueprint-forms/forms/components/CMArticleSystemForm";
import CMVideoTutorialTabPanel from "./forms/CMVideoTutorialTabPanel";
import ContextPropertyFieldGroup from "./forms/ContextPropertyFieldGroup";
import ContentTypes_properties from "@coremedia/studio-client.cap-base-models/content/ContentTypes_properties";
import TrainingContentTypes_properties from "./TrainingContentTypes_properties";

interface TrainingStudioPluginConfig extends Config<StudioPlugin> {
}

class TrainingStudioPlugin extends StudioPlugin{
  declare Config: TrainingStudioPluginConfig;

  static readonly xtype:string = "com.coremedia.blueprint.training.studio.config.trainingStudioPlugin";

  constructor(config:Config<TrainingStudioPlugin> = null){
    super(ConfigUtils.apply(Config(TrainingStudioPlugin, {

      rules: [
        Config(TabbedDocumentFormDispatcher, {
          plugins: [
            Config(AddTabbedDocumentFormsPlugin, {
              documentTabPanels: [
                Config(CMVideoTutorialTabPanel, {
                  itemId: "CMVideoTutorial",
                }),
              ],
            }),
          ],
        }),

        Config(NewContentMenu, {
          plugins: [
            Config(AddItemsPlugin, {
              items: [
                Config(QuickCreateMenuItem, {
                  contentType: "CMVideoTutorial",
                }),
              ],
              before: [
                Config(MenuSeparator, {
                  itemId: "createFromTemplateSeparator",
                }),
              ]
            }),
          ],
        }),

        Config(CMArticleSystemForm, {
          plugins: [
            Config(AddItemsPlugin, {
              items: [
                Config(ContextPropertyFieldGroup),
              ],
              after: [
                Config(ReferrerListPanel),
              ],
            }),
          ],
        }),
      ],
      configuration: [
        new CopyResourceBundleProperties({
          source: resourceManager.getResourceBundle(null, TrainingContentTypes_properties),
          destination: resourceManager.getResourceBundle(null, ContentTypes_properties)
        })
      ],

    }), config));
  }
}

export default TrainingStudioPlugin;
