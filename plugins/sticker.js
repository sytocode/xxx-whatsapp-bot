const WSF = require("wa-sticker-formatter");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require("fs");


const stickermaker = (args,xxx,client) => new Promise(async (resolve, reject) => {

 //async function z() {
  const content = JSON.stringify(xxx.message);
  const from = xxx.key.remoteJid;
  const type = Object.keys(xxx.message)[0];
  const isMedia = type === "imageMessage" || type === "videoMessage";
  const isQuotedImage =type === "extendedTextMessage" && content.includes("imageMessage");
  const isQuotedVideo =type === "extendedTextMessage" && content.includes("videoMessage");
  const isQuotedSticker = type === "extendedTextMessage" && content.includes("stickerMessage");
  const isGroup = from.endsWith("@g.us");
  

  const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
  };

  var packName = "";
  var authorName = "";

  if (args.includes("pack") == true) {
    packNameDataCollection = false;
    for (let i = 0; i < args.length; i++) {
      
      if (args[i].includes("pack") == true) {
        packNameDataCollection = true;
      }
      if (args[i].includes("author") == true) {
        packNameDataCollection = false;
      }
    
      if (packNameDataCollection == true) {
        packName = packName + args[i] + " ";
      }
    }
   
    if (packName.startsWith("pack ")) {
      packName = `${packName.split("pack ")[1]}`;
    }
  }

  
  if (args.includes("author") == true) {
    authorNameDataCollection = false;
    for (let i = 0; i < args.length; i++) {
      console.log(i);
      if (args[i].includes("author") == true) {
        authorNameDataCollection = true;
      }
      
      if (authorNameDataCollection == true) {
        authorName = authorName + args[i] + " ";
      }
      if (authorName.startsWith("author ")) {
        authorName = `${authorName.split("author ")[1]}`;
      }
    }
  }

  if (packName == "") {
    packName = "xXx";
  }
  if (authorName == "") {
    authorName = "BOT";
  }

  outputOptions = [
    `-vcodec`,
    `libwebp`,
    `-vf`,
    `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
  ];
  if (args.includes("crop") == true) {
    outputOptions = [
      `-vcodec`,
      `libwebp`,
      `-vf`,
      `crop=w='min(min(iw\,ih)\,500)':h='min(min(iw\,ih)\,500)',scale=500:500,setsar=1,fps=15`,
      `-loop`,
      `0`,
      `-ss`,
      `00:00:00.0`,
      `-t`,
      `00:00:10.0`,
      `-preset`,
      `default`,
      `-an`,
      `-vsync`,
      `0`,
      `-s`,
      `512:512`,
    ];
  }

  if ((isMedia && !xxx.message.videoMessage) || isQuotedImage) {
    const encmedia = isQuotedImage
      ? JSON.parse(JSON.stringify(xxx).replace("quotedM", "m")).message
          .extendedTextMessage.contextInfo
      : xxx;
    const media = await client.downloadAndSaveMediaMessage(encmedia);
    ran = getRandom(".webp");

    await ffmpeg(`./${media}`)
      .input(media)
      .on("error", function (err) {
        fs.unlinkSync(media);
        console.log(`Error : ${err}`);
        resolve("🤖 ```failed to convert image into sticker!```");
      })
      .on("end", function () {
        buildSticker();
      })
      .addOutputOptions(outputOptions)
      .toFormat("webp")
      .save(ran);

    async function buildSticker() {
      if (args.includes("nodata") == true) {
        console.log(ran);
        resolve(ran )
        

        fs.unlinkSync(media);
       // fs.unlinkSync(ran);
      } else {
        const webpWithMetadata = await WSF.setMetadata(
          packName,
          authorName,
          ran
        );
        console.log(webpWithMetadata);
        resolve(webpWithMetadata)


        fs.unlinkSync(media);
        // fs.unlinkSync(ran);
      }
    }
  } else if (
    (isMedia && xxx.message.videoMessage.seconds < 11) ||
    (isQuotedVideo &&
      xxx.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage
        .seconds < 11)
  ) {
    const encmedia = isQuotedVideo
      ? JSON.parse(JSON.stringify(xxx).replace("quotedM", "xxx")).message
          .extendedTextMessage.contextInfo
      : xxx;
    const media = await client.downloadAndSaveMediaMessage(encmedia);
    ran = getRandom(".webp");

    await ffmpeg(`./${media}`)
      .inputFormat(media.split(".")[1])
      .on("error", function (err) {
        fs.unlinkSync(media);
        mediaType = media.endsWith(".mp4") ? "video" : "gif";
        reject("🤖```ERROR: Failed to convert to sticker!```");
      })
      .on("end", function () {
        buildSticker();
      })
      .addOutputOptions(outputOptions)
      .toFormat("webp")
      .save(ran);

    async function buildSticker() {
      if (args.includes("nodata") == true) {
        resolve(ran)
        fs.unlinkSync(media);
      //   fs.unlinkSync(ran);
      } else {
        const webpWithMetadata = await WSF.setMetadata(
          packName,
          authorName,
          ran
        );
        resolve(webpWithMetadata)
        fs.unlinkSync(media);
       //  fs.unlinkSync(ran);
      }
    }
  }
//}
//z(args,xxx,client)
});
module.exports.stickermaker = stickermaker;