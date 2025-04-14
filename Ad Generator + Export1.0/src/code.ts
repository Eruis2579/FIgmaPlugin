// code.ts
figma.showUI(__html__, { visible: false }); // hide UI unless needed

const templateNames = ["Ad-Template 1:1", "Ad-Template 9:16"];
const controlPanelName = "control panel";
const targetLayers = ["#headline", "#cta", "#hook", "#image"];

function getText(node: FrameNode, name: string): string {
  const textNode = node.findOne(n => n.name === name && n.type === "TEXT") as TextNode;
  return textNode?.characters || "";
}

async function cloneAndFill(template: FrameNode, image: SceneNode, data: any, index: number, ratio: string) {
  const newAd = (template.clone() as FrameNode);
  newAd.x = (index * 1250);
  newAd.y = ratio === "1-1" ? 3000 : 5500;
  newAd.name = `${data.lang}_${data.product}_${data.campaign}_${data.hook}_V${data.version}_P${data.photoId}_${ratio === "1-1" ? "11" : "916"}`.toUpperCase();

  for (const layer of newAd.findAll()) {
    if (layer.name === "#image" && layer.type === "RECTANGLE") {
      const img = (image as RectangleNode).clone();
      img.x = layer.x;
      img.y = layer.y;
      img.resize(layer.width, layer.height);
      newAd.insertChild(0, img);
      layer.remove();
    }
  }

  const jpgBytes = await newAd.exportAsync({ format: "JPG" });
  return { name: `${newAd.name}.jpg`, bytes: jpgBytes };
}

async function generateAllAds() {
  const control = figma.currentPage.findOne(n => n.name === controlPanelName) as FrameNode;
  const data = {
    headline: getText(control, "#headline"),
    cta: getText(control, "#cta"),
    hook: getText(control, "#hook"),
    lang: getText(control, "#lang"),
    product: getText(control, "#product"),
    campaign: getText(control, "#campaign"),
    version: getText(control, "#version")
  };
  const fileName = `${data.lang}_${data.product}_${data.campaign}_${data.hook}_V${data.version}`.toUpperCase();
  const images = figma.currentPage.children.filter(n =>
    n.type === "RECTANGLE" && !templateNames.includes(n.name) && n.name !== controlPanelName
  );

  const templates = Object.fromEntries(templateNames.map(name => [
    name,
    figma.currentPage.findAll().find(n => n.name.trim() === name) as FrameNode
  ]));

  const files = [];

  for (const [i, image] of images.entries()) {
    const photoId = String(i + 1).padStart(3, "0");
    const filledData = { ...data, photoId };

    for (const [templateName, template] of Object.entries(templates)) {
      const ratio = templateName.includes("1:1") ? "1-1" : "9-16";
      const file = await cloneAndFill(template, image, filledData, i, ratio);
      files.push(file);
    }
  }
  figma.notify("✅ Ad generation complete!");
  figma.showUI(__html__, { width: 300, height: 200 });
  figma.ui.postMessage({ type: "EXPORT_ZIP",  fileName:fileName, files});
  figma.ui.postMessage({
    type: 'done',
    message: 'Export completed!!!',
    message2: ' Proceed with the download after a while',
  });
  
}

generateAllAds();
