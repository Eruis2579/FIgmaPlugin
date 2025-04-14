figma.showUI(__html__, { width: 350, height: 250 }); // UI is visible on load

figma.notify("✅ Plugin is successful running!!!");
let gennum = 0
const templateNames = ["Ad-Template 1:1", "Ad-Template 9:16"];
const controlPanelName = "control panel";

function getText(node: FrameNode, name: string): string {
  const textNode = node.findOne(n => n.name === name && n.type === "TEXT") as TextNode;
  return textNode?.characters || "";
}

async function cloneAndFill(template: FrameNode, image: SceneNode, data: any, index: number, ratio: string, num:number) {
  const newAd = (template.clone() as FrameNode);
  newAd.x = (index * 1250);
  newAd.y = ratio === "1-1" ? 3000+(num-1)*5500 : num*5500;
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

async function generateAllAds(inputData:any) {
  gennum+=1
  const control = figma.currentPage.findOne(n => n.name === controlPanelName) as FrameNode;
  const data = {
    lang:inputData.lang || "NO",
    product:inputData.category || "HH",
    campaign:inputData.campaign || "EVERGREEN",
    hook:inputData.hook || "WHYLOVE",
    version:inputData.version || 1
  }
  const images = figma.currentPage.children.filter(n =>
    n.type === "RECTANGLE" && !templateNames.includes(n.name) && n.name !== controlPanelName
  );

  const templates = Object.fromEntries(templateNames.map(name => [
    name,
    figma.currentPage.findAll().find(n => n.name.trim() === name) as FrameNode
  ]));

  for (const [i, image] of images.entries()) {
    const photoId = String(i + 1).padStart(3, "0");
    const filledData = { ...data, photoId };

    for (const [templateName, template] of Object.entries(templates)) {
      const ratio = templateName.includes("1:1") ? "1-1" : "9-16";
      await cloneAndFill(template, image, filledData, i, ratio, gennum);
    }
  }

  figma.notify("✅ Ads generated! Select frames and click Export.");
}

async function exportSelectedAds() {
  const selected = figma.currentPage.selection;
  const frames = selected.filter(n =>
    !n.name.toLowerCase().includes("template") &&
    n.name !== controlPanelName
  ) as FrameNode[];

  if (frames.length === 0) {
    figma.notify("⚠️ Please select generated ad frames to export.");
    return;
  }

  const files = [];
  for (const frame of frames) {
    const jpg = await frame.exportAsync({ format: "JPG" });
    files.push({ name: `${frame.name}.jpg`, bytes: jpg });
  }

  const fileName = `Exported_Ads`;
  figma.ui.postMessage({ type: "EXPORT_ZIP", fileName, files });

  figma.notify("✅ Export completed! Your ZIP is ready for download.");
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-ads') {
    await generateAllAds(msg.data);
  }
  if (msg.type === 'export-ads') {
    await exportSelectedAds();
  }
  if (msg.type === "cancel") {
    figma.closePlugin("Cancelled by user");
  }
};
