import puppeteer from "puppeteer";

export const getNotification = async (channel) => {
  const kickUrl = `https://kick.com/${channel.toLowerCase()}`;
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/nix/store/x205pbkd5xh5g4iv0g58xjla55has3cx-chromium-108.0.5359.94/bin/chromium-browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto(`https://kick.com/api/v1/channels/${channel.toLowerCase()}`, {waitUntil: "networkidle0"});

  const data = await page.evaluate(() => {
    const scripts = document.querySelectorAll("script");
    scripts.forEach(script => script.remove());
    return document.body.innerHTML;
  });
  const channelData = JSON.parse(data);

  let check, title, category, thumbnail, user, profile_pic, followers;
  user = channelData.user.username;
  followers = channelData.followersCount;
  profile_pic = channelData.user.profile_pic;
  if (channelData.livestream == null) {
    check = 0;
    title = "";
    category = "";
    thumbnail = "";
  } else {
    check = 1;
    title = channelData.livestream.session_title;
    category = channelData.livestream.categories[0].name;
    thumbnail = channelData.livestream.thumbnail.url;
  }
  const worker = await fetch(`${process.env["AHMED_WORKER"]}/dc/kick-live?channel=zihnee&check=${check}`);
  const workerR = await worker.json();
  const notificar = workerR.notificar;

  console.log({
    is_live: check,
    notify: workerR.notificar,
    user: user,
    followers: followers,
    title: title,
    category: category,
    profile_pic: profile_pic,
    thumbnail: thumbnail
  });

  const msg = `@everyone ${channel} ya comenzó directo en KICK! Vení a verla: <${kickUrl}>\n<:kick:1124341413778305126> ${title}`;

  const embed = {
    color: 0xf697c8,
    title: title,
    url: kickUrl,
    author: {
      name: user,
      icon_url: profile_pic
    },
    fields: [
      {
        name: "Categoría",
        value: category,
        inline: true
      },
      {
        name: "Seguidores",
        value: followers,
        inline: true
      }
    ],
    image: {
      url: thumbnail
    },
    timestamp: new Date().toISOString(),
    footer: {
      text: "Kick",
      icon_url: "https://gemi-chan.ahmedrangel.com/images/kick-footer.png"
    }
  };

  const components = {
    type: 1,
    components: [{
      type: 2,
      label: "Ver en Kick",
      url: kickUrl,
      style: 5
    }]
  };

  let send;
  notificar == true ? send = {
    content: msg,
    embeds: [embed],
    components: [components]
  } : send = null;
  await browser.close();
  return send;
};