import DiscordRPC from 'discord-rpc';

export const mappedIcons = [
  "amillusion",
  "answeredprayers",
  "braingirl",
  "deepdreams",
  "flow",
  "someday",
  "unevendream",
  "yno-logo",
  "yume2kki",
  "yumenikki",
  "mumarope",
  "genie",
  "mikan",
  "2kki",
  "yume",
  "prayers",
  "muma",
  "dreamgenie",
  "mikanmuzou",
  "ultraviolet",
  "sheawaits",
  "oversomnia",
  "yumetsushin",
  "nostalgic",
  "collectiveunconscious",
];

export const isConnected = (text) => {
  const privatemodes = [
    "وضع الخاص",
    "Private Mode",
    "Private Mode",
    "Private Mode",
    "Mode privé",
    "Private Mode",
    "プライベートモード",
    "비공 개 모드",
    "Tryb prywatny",
    "Modo Privado",
    "Private Mode",
    "Приватный режим",
    "Private Mode",
    "Riêng tư",
    "私密模式",
  ];
  const connecteds = [
    "متصل",
    "Verbunden",
    "Connected",
    "Conectado",
    "Connecté(e)",
    "Connesso",
    "接続済み",
    "연결됨",
    "Połączony",
    "Conectado",
    "Conectat",
    "В сети",
    "Bağlı",
    "Đã kết nối",
    "已连接",
  ];

  return privatemodes.includes(text) || connecteds.includes(text);
};

export const retryConnection = (client, err) => {
  console.log("Retry IPC");
  console.log(err);
  client = new DiscordRPC.Client({ transport: "ipc" });
  client.login({ clientId: "1028080411772977212" }).catch(console.error);
};

export const updatePresence = (web, client, gamename = null) => {
  if (!client) return;
  
  console.log("Update Presence");
  console.log(gamename);

  if (gamename == null) {
    client
      .setActivity({
        largeImageKey: "yno-logo",
        largeImageText: "Yume Nikki Online Project",
        details: "Choosing a game...",
        instance: false,
        buttons: [{ label: "Play YNOproject", url: `https://ynoproject.net/` }],
      })
      .catch((err) => retryConnection(client, err));
  } else {
    web
      .executeJavaScript(
        `
        (function() {
          var querys = document.querySelector("#locationText").querySelectorAll("span")
          if (querys == null || querys.length < 1) {
            querys = document.querySelector("#locationText").querySelectorAll("a")
          }

          if (querys == null || querys.length < 1)
          {
            currentLocation = "Unknown";
          }
          else
          {
            for (i = 0; i < querys.length; i++)
            {
              isPowerOfTwo = (i % 2) == 0;
              currentLocation = (!isPowerOfTwo ? "(" : "") + querys.item(i).textContent + (!isPowerOfTwo ? ")" + (i + 1 == querys.length ? "" : " |") : "") + " ";
            }
          }

          return {
            name: window.location.pathname.replaceAll('/', ''),
            currentLocation,
            connected: document.querySelector("#connStatusText")?.textContent,
            url: document.URL
          }
        })()
      `
      )
      .then((data) => {
        const condensedName = gamename
          .toLowerCase()
          .replace(" ", "")
          .replace(".", "");
        let buttonGame = gamename;

        if (gamename == "Collective Unconscious") {
          buttonGame = "C.U.";
        } else if (gamename.length > 32) {
          buttonGame = gamename.slice(0, 28) + "...";
        }

        let activityButtons = [
          { label: "Play " + buttonGame + " online", url: data.url },
        ];
        client
          .setActivity({
            largeImageKey: mappedIcons.includes(condensedName)
              ? condensedName + "-icon"
              : `https://ynoproject.net/images/door_${data.name}.gif`,
            largeImageText: gamename,
            smallImageKey: "yno-logo",
            smallImageText: "Yume Nikki Online Project",
            details: "Dreaming on " + gamename,
            state: isConnected(data.connected)
              ? data.currentLocation
              : "Disconnected",
            instance: false,
            buttons: activityButtons,
          })
          .catch((err) => retryConnection(client, err));
      });
  }
};
