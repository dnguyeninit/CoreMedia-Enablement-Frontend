import Config from "@jangaroo/runtime/Config";
import ConfigUtils from "@jangaroo/runtime/ConfigUtils";
import FieldContainer from "@jangaroo/ext-ts/form/FieldContainer";
import GridPanel from "@jangaroo/ext-ts/grid/Panel";
import GridColumn from "@jangaroo/ext-ts/grid/column/Column";
import DataField from "@jangaroo/ext-ts/data/field/Field";
import Toolbar from "@jangaroo/ext-ts/toolbar/Toolbar";
import ValueExpression from "@coremedia/studio-client.client-core/data/ValueExpression";
import BindListPlugin from "@coremedia/studio-client.ext.ui-components/plugins/BindListPlugin";
import IconButton from "@coremedia/studio-client.ext.ui-components/components/IconButton";
import BindSelectionPlugin from "@coremedia/studio-client.ext.ui-components/plugins/BindSelectionPlugin";
import OpenInTabAction from "@coremedia/studio-client.ext.form-services-toolkit/actions/OpenInTabAction";
import ContentLocalizationUtil from "@coremedia/studio-client.cap-base-models/content/ContentLocalizationUtil";
import ContentLifecycleUtil from "@coremedia/studio-client.cap-base-models/content/ContentLifecycleUtil";
import TypeIconColumn from "@coremedia/studio-client.ext.cap-base-components/columns/TypeIconColumn";
import StatusColumn from "@coremedia/studio-client.ext.cap-base-components/columns/StatusColumn";
import DerivedNavigationContextFieldBase from "./DerivedNavigationContextFieldBase";
import DerivedNavigationContextField_properties from "./DerivedNavigationContextField_properties";

interface DerivedNavigationContextFieldConfig extends Config<FieldContainer>, Partial<Pick<DerivedNavigationContextField, "bindTo">> {}

class DerivedNavigationContextField extends DerivedNavigationContextFieldBase {
  declare Config: DerivedNavigationContextFieldConfig;

  static override readonly xtype:string = "com.coremedia.blueprint.training.studio.config.derivedNavigationContextField";

  constructor(config: Config<DerivedNavigationContextField> = null) {
    super((() => { return ConfigUtils.apply(Config(DerivedNavigationContextField, {
      fieldLabel: DerivedNavigationContextField_properties.fieldLabel_text,
      items: [
        Config(GridPanel,{
          tbar: Config(Toolbar, {
            items: [
              Config(IconButton, {
                itemId: "openSelectionInTab",
                baseAction: Config(OpenInTabAction, {
                  contentValueExpression: this.getSelectionExpression(),
                }),
              }),
              Config(IconButton, {
                itemId: "openFolderPropertiesInTab",
                text: DerivedNavigationContextField_properties.toolbar_openFolderPropertiesInTab_text,
                tooltip: DerivedNavigationContextField_properties.toolbar_openFolderPropertiesInTab_tooltip,
                iconCls: DerivedNavigationContextField_properties.toolbar_openFolderPropertiesInTab_icon,
                baseAction: Config(OpenInTabAction, {
                  contentValueExpression: this.getFolderPropertiesExpression(config),
                }),
              }),
            ],
          }),
          columns: [
            Config(TypeIconColumn,{
              dataIndex: "typeCls",
              text: DerivedNavigationContextField_properties.gridpanel_columns_type_text,
              sortable: false,
            }),
            Config(GridColumn, {
              dataIndex: "name",
              text: DerivedNavigationContextField_properties.gridpanel_columns_name_text,
              sortable: false,
              flex: 1,
            }),
            Config(StatusColumn,{
              dataIndex: "status",
              text: DerivedNavigationContextField_properties.gridpanel_columns_status_text,
              sortable: false,
            }),
          ],
          plugins: [
            Config(BindListPlugin, {
              bindTo: this.getDerivedContextExpression(config),
              fields: [
                Config(DataField, {
                  name: "typeCls",
                  mapping: "type",
                  convert: ContentLocalizationUtil.getIconStyleClassForContentType,
                }),
                Config(DataField, {
                  name: "name",
                  mapping: "name",
                }),
                Config(DataField, {
                  name: "status",
                  mapping: "",
                  convert: ContentLifecycleUtil.getDetailedLifecycleStatus,
                }),
              ],
            }),
            Config(BindSelectionPlugin, {
              selectedValues: this.getSelectionExpression(),
            }),
          ],
        }),
      ],
    }), config); })());
  }

  /**
   * Configuration property:
   * value expression to the content object
   **/
  bindTo: ValueExpression;

}

export default DerivedNavigationContextField;
