const express = require("express");
const http = require("http");

const port = process.env.PORT || 5011;
const app = express();
const server = http.createServer(app);
const bodyParser = require("body-parser");

app.use(bodyParser());
server.listen(port, () => console.log(`Listening on port ${port}`));

require("nightmare-wait-for-url");
const Nightmare = require("nightmare");
const needle = require("needle");
//const tress = require("tress");
const waitUntil = require("wait-until");
let sender = null;

let youtubes = [
  "https://www.youtube.com/watch?v=1u3jXdkwLdQ",
  "https://www.youtube.com/watch?v=0-fns5Qihn8",
  "https://www.youtube.com/watch?v=OHa0-BlGMLg",
  "https://www.youtube.com/watch?v=1PkJjcNHZJY",
  "https://www.youtube.com/watch?v=h4qwZvIYswQ",
  "https://www.youtube.com/watch?v=HZi9ls9emUE",
  "https://www.youtube.com/watch?v=CsI4VxJ1IBQ",
  "https://www.youtube.com/watch?v=wcRYNLSHVm4",
  "https://www.youtube.com/watch?v=tmdfocdE98M",
  "https://www.youtube.com/watch?v=4zNAYGiJo5M",
  "https://www.youtube.com/watch?v=ikCOmABqEPQ",
  "https://www.youtube.com/watch?v=s8aRC-7sBo8",
  "https://www.youtube.com/watch?v=CsI4VxJ1IBQ",
  "https://www.youtube.com/watch?v=7uA0bk5AOyw",
  "https://www.youtube.com/watch?v=1u3jXdkwLdQ",
  "https://www.youtube.com/watch?v=eBmAkIdLWYs",
  "https://www.youtube.com/watch?v=HZi9ls9emUE",
  "https://www.youtube.com/watch?v=zeuLMV6MgeU",
  "https://www.youtube.com/watch?v=tawOwZvfZNw",
  "https://www.youtube.com/watch?v=3W151Vp3Y0w",
  "https://www.youtube.com/watch?v=utJGnK9D_UQ",
  "https://www.youtube.com/watch?v=nIXQK8K66U8",
  "https://www.youtube.com/watch?v=tBiPumGnVT4",
  "https://www.youtube.com/watch?v=3H8xCyjQykQ",
  "https://www.youtube.com/watch?v=1u3jXdkwLdQ",
  "https://www.youtube.com/watch?v=Fux6JsEe1ZU"
];

let searches = [
  "react",
  "angular",
  "vue",
  "electron",
  "stripe api",
  "google api",
  "Twilio api",
  "mongodb",
  "mysql",
  "postgresql",
  "what is github",
  "what is b2b",
  "when do you say nope",
  "graphql",
  "stripe google",
  "youtube",
  "css margin",
  "scss properties",
  "what is sass",
  "what is less",
  "QA testing",
  "selenium automation",
  "web scraping",
  "what is one click",
  "what is recaptcha"
];

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

let min_slp = 2;
let max_slp = 3;
let min_run = 4;
let max_run = 6;
let max_profiles = 1;
let gsearch = true;
let youtube = true;
let youtube_duration_min = 3;
let youtube_duration_max = 4;
let gsearch_duration_min = 0.05;
let gsearch_duration_max = 0.8;
let total_loop = 1;
let scroll_down_min = 0;
let scroll_down_max = 300;

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
  const electronPath = require("nightmare/node_modules/electron");
  console.log(electronPath);

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
    openDevTools: true
  });

  if (proxy) {
    nightmare = new Nightmare({
      show: true,
      electronPath,
      openDevTools: true,
      waitTimeout: 3600000,
      gotoTimeout: 3600000,
      alwaysOnTop: false,
      switches: {
        "proxy-server": proxy
      }
    });
  }

  const bot = { nightmare, email: task.email };
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
      .goto("https://www.google.com")
      .cookies.clearAll()
      .header(
        "x-chrome-id-consistency-request",
        "version=1,client_id=77185425430.apps.googleusercontent.com,device_id=db988b4e-56d9-4514-82ab-78f49fdcb703,signin_mode=all_accounts,signout_mode=show_confirmation"
      )
      .header(
        "x-client-data",
        "CIe2yQEIpbbJAQjUt8kBCIiSygEIqp3KAQjIo8oBCKulygEIoKnKAQiXrcoBCM2tygEIsa7KAQjGr8oB"
      )
      .header("cache-control", "max-age=0")
      .header("accept-language", "en-US,en;q=0.9")
      .goto(
        "https://accounts.google.com/signin/v2/identifier?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&followup=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=ServiceLogin"
      )
      .cookies.get()
      .then(cookie => console.log("cookie", cookie));
    await nightmare
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

  sender.send("actionLog", { status: "Marinating", email: task.email });
  // mySocket.emit("actionLog", {
  //   email: task.email,
  //   status: "Marinating"
  // });

  const targets = myTargets.slice(0);
  try {
    let length = 0;
    if (gsearch) length += searches.length;
    if (youtube) length += youtubes.length;
    if (length) {
      const percent = parseFloat(100) / length;
      console.log(percent);
      sender.send("oneClick", { value: percent, email: task.email });
    }
    for (let i = 0; i < total_loop; i += 1) {
      task.currentTarget = 0;
      while (task.currentTarget < targets.length) {
        const target = targets[task.currentTarget];

        const waitForReady = () => {
          return new Promise((res, rej) => {
            const id = setInterval(async () => {
              if (nightmare.url() !== "https://a.com/") {
                res(true);
                clearInterval(id);
              }
            }, 500);
          });
        };

        await waitForReady();

        try {
          if (target.includes("https://www.youtube.com") && youtube) {
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
    // mySocket.emit("actionLog", {
    //   email: task.email,
    //   status: "Marinating"
    // });
    sender.send("actionLog", "Marinating");
    const bot = paused_bots[index];
    paused_bots.splice(index, 1);
    running_bots.push(bot);
    bot.currentTarget += 1;
    const target = myTargets[bot.currentTarget];
    if (target.includes("https://www.youtube.com") && youtube) {
      bot.nightmare.goto(target);
    } else if (gsearch) {
      bot.nightmare.goto("https://www.google.com/");
    }
    const id = setTimeout(() => pauseTask(task), randomMsSec(min_run, max_run));
    bot.timeId = id;
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
    // mySocket.emit("actionLog", {
    //   email: task.email,
    //   status: "Napping"
    // });
    sender.send("actionLog", { email: task.email, status: "Napping" });
    const nightmare = running_bots[index].nightmare;
    await nightmare.goto("https://a.com/");

    const id = setTimeout(() => addTask(task), randomMsSec(min_slp, max_slp));
    paused_bots.push(running_bots[index]);
    running_bots.timeId = id;
    running_bots.splice(index, 1);
    running_profiles -= 1;
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
    await running_bots[index].nightmare.show();
  } else {
    const index = paused_bots.findIndex(bot => bot.email === task.email);
    await running_bots[index].nightmare.show();
  }
};

export const hideTask = async task => {
  console.log("hide task ....", task.email);
  const index = running_bots.findIndex(bot => bot.email === task.email);
  if (index !== -1) {
    await running_bots[index].nightmare.hide();
  } else {
    console.log(index);
    if (index !== -1) {
      await running_bots[index].nightmare.hide();
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
  } else {
    min_run = duration.min;
    max_slp = duration.max;
  }
};

const setSettings = (duration, maxProfile, gs, yt) => {
  setDuration("slp", duration.sleep);
  setDuration("run", duration.run);
  max_profiles = maxProfile;
  gsearch = gs;
  youtube = yt;
};

app.post("/checkproxy", (req, res) => {
  console.log("proxy", req.body.myProxy, req.body.username, req.body.password);
  let proxy = req.body.myProxy;
  if (req.body.username)
    proxy = `${req.body.username}:${req.body.password}@${req.body.myProxy}`;

  needle.get(
    "https://www.google.com",
    {
      proxy,
      read_timeout: 5000,
      open_timeout: 5000,
      response_timeout: 5000
    },
    err => {
      if (err) {
        console.log("false", err);
        res.send(false);
      } else {
        console.log("true");
        res.send(true);
      }
    }
  );
});

export const setSender = emitter => {
  sender = emitter;
};
