const path = require("path");
const performance = require("performance");
import urlsGsearch from "./urlsGsearch";
import urlsYoutube from "./urlsYoutube";
import { basicURL } from "./index";

require("nightmare-wait-for-url");
const Nightmare = require("nightmare");
const request = require("request");
let sender = null;

let youtubes = urlsYoutube;
let searches = urlsGsearch;

let myTargets = [];

const randomNumber = (min, max) => {
  return Math.random() * (max - min) + min;
};

const randomMsSec = (min, max) => {
  return randomNumber(min, max) * 60 * 1000;
};

const mixTargets = () => {
  const min = 1;
  const max = 4;
  let i = 0;
  let j = 0;
  const yLength = youtubes.length;
  const gLength = searches.length;

  while (i < yLength && j < gLength) {
    let end = i + randomNumber(min, max);
    while (i < end && i < yLength) {
      myTargets.push(youtubes[i]);
      i += 1;
    }
    end = j + randomNumber(min, max);
    while (j < end && j < gLength) {
      myTargets.push(searches[j]);
      j += 1;
    }
  }

  if (i === yLength) {
    while (j < gLength) {
      myTargets.push(searches[j]);
      j += 1;
    }
  } else if (j === gLength) {
    while (i < yLength) {
      myTargets.push(youtubes[i]);
      i += 1;
    }
  }

  console.log(myTargets);
};

mixTargets();

let running_profiles = 0;
const running_bots = [];
const scheduled_bots = [];
const paused_bots = [];

let min_slp = 10;
let max_slp = 20;
let min_run = 45;
let max_run = 60;
let max_profiles = 1;
let gsearch = true;
let youtube = true;
let youtube_duration_min = 3;
let youtube_duration_max = 4;
let gsearch_duration_min = 0.01;
let gsearch_duration_max = 0.1;
let total_loop = 1;

Nightmare.action(
  "show",
  function(name, options, parent, win, renderer, done) {
    parent.respondTo("show", function(inactive, done) {
      if (inactive) {
        win.showInactive();
      } else {
        win.show();
      }

      done();
    });

    done();
  },
  function(inactive, done) {
    this.child.call("show", inactive, done);
  }
);

Nightmare.action(
  "hide",
  function(name, options, parent, win, renderer, done) {
    parent.respondTo("hide", function(done) {
      win.hide();
      done();
    });

    done();
  },
  function(done) {
    this.child.call("hide", done);
  }
);

const runTask = async task => {
  const electronPath =
    process.env.NODE_ENV === "development"
      ? require("nightmare/node_modules/electron")
      : path.join(
          process.resourcesPath,
          "app.asar.unpacked/node_modules/nightmare/node_modules/electron/dist/" +
            (process.platform === "win32"
              ? "Electron.exe"
              : "Electron.app/Contents/MacOS/Electron")
        );

  let proxy, username, password;
  if (task.proxy !== "None") {
    const str = task.proxy.split("@");
    let user = str.length > 1 ? str[0] : null;
    let proxi = str.length > 1 ? str[1] : str[0];
    if (user) {
      username = user.split(":")[0];
      password = user.split(":")[1];
    }
    if (proxi) {
      proxy = proxi;
    }
  }
  let nightmare = new Nightmare({
    show: true,
    electronPath,
    waitTimeout: 3600000,
    gotoTimeout: 3600000,
    alwaysOnTop: false,
    title: "altX Bot Tools",
    icon: basicURL + "/icon.ico"
  });

  if (proxy) {
    nightmare = new Nightmare({
      show: true,
      electronPath,
      waitTimeout: 3600000,
      gotoTimeout: 3600000,
      alwaysOnTop: false,
      switches: {
        "proxy-server": proxy
      }
    });
  }

  const bot = { nightmare, email: task.email, task };
  running_bots.push(bot);

  const inputPassword = () => {
    return new Promise((res, rej) => {
      const id = setInterval(async () => {
        try {
          nightmare
            .type("input[name='password']", task.password)
            .type("input[name='password']", "\u000d");
          res(true);
          clearInterval(id);
        } catch (e) {}
      }, 1000);
    });
  };

  sender.send("actionLog", { status: "Logging in", email: task.email });
  try {
    await nightmare
      .useragent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.54 Safari/537.36"
      )
      .authentication(username, password)
      .goto(
        "https://accounts.google.com/signin/v2/identifier?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&followup=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=ServiceLogin"
      )
      .wait("#identifierId")
      .type("#identifierId", task.email)
      .type("#identifierId", "\u000d")
      .wait("#profileIdentifier")
      .wait(3000);

    await inputPassword();
    console.log("inputed credentials, waiting mailbox ...", task.email);

    await nightmare.wait('figure[class="HJOYV HJOYVi11 Vz93id"]');
    console.log("successfully logged in ...", task.email);
    await nightmare.hide();
    sender.send("eye", { email: task.email });
  } catch (e) {
    return;
  }

  const id = setTimeout(() => pauseTask(task), randomMsSec(min_run, max_run));
  bot.timeId = id;
  bot.fTime = performance.now();

  sender.send("actionLog", { status: "Marinating", email: task.email });

  const targets = myTargets.slice(0);
  targets.sort(() => Math.random() - 0.5);
  try {
    let length = 0;
    if (gsearch) length += searches.length;
    if (youtube) length += youtubes.length;
    if (length) {
      const percent = parseFloat(100) / length;
      sender.send("oneClick", { value: parseFloat(0.13), email: task.email });
    }
    for (let i = 0; i < total_loop; i += 1) {
      task.currentTarget = 0;
      while (task.currentTarget < targets.length) {
        const target = targets[task.currentTarget];

        const waitForReady = () => {
          return new Promise((res, rej) => {
            const id = setInterval(async () => {
              if (nightmare.url() !== "https://linkedin.com/") {
                res(true);
                clearInterval(id);
              }
            }, 500);
          });
        };

        await waitForReady();

        try {
          if (target.toLowerCase().includes("youtube.com") && youtube) {
            console.log(
              "youtube video watching ....",
              target,
              task.email,
              Date(Date.now())
            );
            await nightmare.goto(target);
            await nightmare.wait(
              randomMsSec(youtube_duration_min, youtube_duration_max)
            );
          } else if (gsearch) {
            console.log(
              "Google bulk ad keyword searching ....",
              target,
              task.email,
              Date(Date.now())
            );
            await nightmare.goto("https://www.google.com");
            await nightmare
              .wait("input[name='q']")
              .type("input[name='q']", target)
              .type("input[name='q']", "\u000d")
              .click("div[class='r'] a")
              .wait(randomMsSec(gsearch_duration_min, gsearch_duration_max));
          }
        } catch (e) {}

        task.currentTarget++;
      }
    }
  } catch (e) {
    return;
  }

  await nightmare.end();
  running_bots.splice(running_bots.findIndex(bot => bot.email === task.email));
  sender.send("actionLog", { status: "Scheming", email: task.email });
};

const startTask = task => {
  running_profiles += 1;

  const i = scheduled_bots.findIndex(bot => bot.email === task.email);
  if (i !== -1) scheduled_bots.splice(i, 1);

  const index = paused_bots.findIndex(bot => bot.email === task.email);

  if (index === -1) {
    console.log("starting task ....", task.email);
    runTask(task);
  } else {
    console.log("resuming task ....", task.email);
    sender.send("actionLog", "Marinating");
    const bot = paused_bots[index];
    paused_bots.splice(index, 1);
    running_bots.push(bot);
    let target = myTargets[bot.currentTarget];
    while (!target) {
      target = myTargets[--bot.currentTarget];
    }
    if (target.includes("youtube.com") && youtube) {
      bot.nightmare.goto(target);
    } else if (gsearch) {
      bot.nightmare.goto("https://www.google.com/");
    }
    const id = setTimeout(() => pauseTask(task), randomMsSec(min_run, max_run));
    bot.timeId = id;
    bot.fTime = performance.now();
  }
};

export const addTask = task => {
  const bot = { email: task.email };
  scheduled_bots.push(bot);
  sender.send("actionLog", { status: "Scheduling", email: task.email });
  const id = setInterval(() => {
    if (running_profiles < max_profiles) {
      clearInterval(id);
      bot.timeId = null;
      startTask(task);
    }
  }, 1000);
  bot.timeId = id;
};

const pauseTask = async task => {
  const index = running_bots.findIndex(bot => bot.email === task.email);
  if (index === -1) {
    console.log("No running task to pause", task.email);
    return;
  }

  try {
    console.log("pausing task ....", task.email);
    sender.send("actionLog", { email: task.email, status: "Napping" });
    const nightmare = running_bots[index].nightmare;
    running_profiles -= 1;
    const id = setTimeout(() => addTask(task), randomMsSec(min_slp, max_slp));
    paused_bots.push(running_bots[index]);
    running_bots.timeId = id;
    running_bots.fTime = performance.now();
    running_bots.splice(index, 1);
    await nightmare.goto("https://linkedin.com/");
  } catch (e) {}
};

export const stopTask = async task => {
  console.log("terminating task ....", task.email);
  sender.send("actionLog", { status: "Terminated", email: task.email });
  let i = scheduled_bots.findIndex(bot => bot.email === task.email);
  if (i !== -1) {
    clearTimeout(scheduled_bots[i].timeId);
    clearInterval(scheduled_bots[i].timeId);
    scheduled_bots.splice(i, 1);
    return;
  }

  i = running_bots.findIndex(bot => bot.email === task.email);
  if (i !== -1) {
    const bot = running_bots[i];
    clearTimeout(bot.timeId);
    clearInterval(bot.timeId);
    try {
      await bot.nightmare.end();
    } catch (e) {}
    running_bots.splice(i, 1);
    running_profiles -= 1;
    return;
  }

  i = paused_bots.findIndex(bot => bot.email === task.email);
  if (i !== -1) {
    const bot = paused_bots[i];
    clearTimeout(bot.timeId);
    clearInterval(bot.timeId);
    try {
      await bot.nightmare.end();
    } catch (e) {}
    paused_bots.splice(i, 1);
    return;
  }

  console.log("No task to terminate");
};

export const showTask = async task => {
  const index = running_bots.findIndex(bot => bot.email === task.email);
  if (index !== -1) {
    console.log("showing running task ....", task.email);
    await running_bots[index].nightmare.show();
  } else {
    const index = paused_bots.findIndex(bot => bot.email === task.email);
    if (index !== -1) {
      console.log("showing paused task ....", task.email);
      await paused_bots[index].nightmare.show();
    }
  }
};

export const hideTask = async task => {
  const index = running_bots.findIndex(bot => bot.email === task.email);
  if (index !== -1) {
    console.log("hiding running task ....", task.email);
    await running_bots[index].nightmare.hide();
  } else {
    const index = paused_bots.findIndex(bot => bot.email === task.email);
    if (index !== -1) {
      console.log("hiding paused task ....", task.email);
      await paused_bots[index].nightmare.hide();
    }
  }
};

export const changeSetting = (duration, maxProfile, gsearch, youtube) => {
  setSettings(duration, maxProfile, gsearch, youtube);
};

const setDuration = (type, duration) => {
  if (type === "slp") {
    min_slp = duration.min;
    max_slp = duration.max;

    paused_bots.map(bot => {
      const elp = performance.now() - bot.fTime;
      const rmt = randomMsSec(min_slp, max_slp) - elp;
      clearTimeout(bot.timeId);
      if (rmt > 0) {
        bot.timeId = setTimeout(() => addTask(bot.task), rmt);
      } else {
        addTask(bot.task);
      }
    });
  } else {
    min_run = duration.min;
    max_slp = duration.max;

    running_bots.map(bot => {
      const elp = performance.now() - bot.fTime;
      const rmt = randomMsSec(min_slp, max_slp) - elp;
      clearTimeout(bot.timeId);
      if (rmt > 0) {
        bot.timeId = setTimeout(() => pauseTask(bot.task), rmt);
      } else {
        pauseTask(bot.task);
      }
    });
  }
};

const setSettings = (duration, maxProfile, gs, yt) => {
  console.log("settings ....");
  setDuration("slp", duration.sleep);
  setDuration("run", duration.run);
  max_profiles = maxProfile;
  gsearch = gs;
  youtube = yt;
};

export const setSender = emitter => {
  sender = emitter;
};
