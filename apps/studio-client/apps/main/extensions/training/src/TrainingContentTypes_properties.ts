import CoreIcons_properties from "@coremedia/studio-client.core-icons/CoreIcons_properties";


interface TrainingContentTypes_properties {
  CMVideoTutorial_text: string;
  CMVideoTutorial_toolTip: string;
  CMVideoTutorial_icon: string;

  CMVideoTutorial_title_text: string;

  CMVideoTutorial_detailText_text: string;

  CMVideoTutorial_video_text: string;
  CMVideoTutorial_video_emptyText: string;

  CMVideoTutorial_copyright_text: string;
  CMVideoTutorial_copyright_emptyText: string;

  CMVideoTutorial_productionInfo_text: string;

  CMVideoTutorial_duration_text: string;
  CMVideoTutorial_duration_emptyText: string;

  CMVideoTutorial_featuredProduct_text: string;
  CMVideoTutorial_featuredProduct_emptyText: string;

  CMVideoTutorial_pictures_text: string;

}

const TrainingContentTypes_properties: TrainingContentTypes_properties = {
  CMVideoTutorial_text: "Video Tutorial",
  CMVideoTutorial_toolTip: "Video Tutorial",
  CMVideoTutorial_icon: CoreIcons_properties.type_asset_video,
  CMVideoTutorial_title_text: "Title",
  CMVideoTutorial_detailText_text: "Text",
  CMVideoTutorial_video_text: "Video",
  CMVideoTutorial_video_emptyText: "Click here to add a video",

  CMVideoTutorial_copyright_text: "Copyright",
  CMVideoTutorial_copyright_emptyText: "Enter the copyright text here",
  CMVideoTutorial_productionInfo_text: "Production Infomation",
  CMVideoTutorial_duration_text: "Duration (min)",
  CMVideoTutorial_duration_emptyText: "Enter the duration of the video in minutes",
  CMVideoTutorial_featuredProduct_text: "Featured Product",
  CMVideoTutorial_featuredProduct_emptyText: "Click here to select a product",
  CMVideoTutorial_pictures_text: "Teaser Picture",
};

export default TrainingContentTypes_properties;

