const express = require("express");
const socketIo = require("socket.io");
const http = require("http");

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const needle = require("needle");
const bodyParser = require("body-parser");
const tress = require("tress");
const waitUntil = require("wait-until");

let myTargets = [
  "react",
  "https://www.youtube.com/watch?v=1u3jXdkwLdQ",
  "https://www.youtube.com/watch?v=0-fns5Qihn8",
  "angular",
  "vue",
  "electron",
  "https://www.youtube.com/watch?v=OHa0-BlGMLg",
  "stripe api",
  "google api",
  "https://www.youtube.com/watch?v=1PkJjcNHZJY",
  "https://www.youtube.com/watch?v=h4qwZvIYswQ",
  "https://www.youtube.com/watch?v=HZi9ls9emUE",
  "Twilio api",
  "https://www.youtube.com/watch?v=CsI4VxJ1IBQ",
  "mongodb",
  "https://www.youtube.com/watch?v=wcRYNLSHVm4",
  "https://www.youtube.com/watch?v=tmdfocdE98M",
  "mysql",
  "https://www.youtube.com/watch?v=4zNAYGiJo5M",
  "postgresql",
  "what is github",
  "https://www.youtube.com/watch?v=ikCOmABqEPQ",
  "https://www.youtube.com/watch?v=s8aRC-7sBo8",
  "what is b2b",
  "https://www.youtube.com/watch?v=CsI4VxJ1IBQ",
  "when do you say nope",
  "https://www.youtube.com/watch?v=7uA0bk5AOyw",
  "https://www.youtube.com/watch?v=1u3jXdkwLdQ",
  "https://www.youtube.com/watch?v=eBmAkIdLWYs",
  "graphql",
  "https://www.youtube.com/watch?v=HZi9ls9emUE",
  "https://www.youtube.com/watch?v=zeuLMV6MgeU",
  "stripe google",
  "https://www.youtube.com/watch?v=tawOwZvfZNw",
  "youtube",
  "css margin",
  "https://www.youtube.com/watch?v=3W151Vp3Y0w",
  "scss properties",
  "what is sass",
  "https://www.youtube.com/watch?v=utJGnK9D_UQ",
  "https://www.youtube.com/watch?v=nIXQK8K66U8",
  "what is less",
  "QA testing",
  "https://www.youtube.com/watch?v=tBiPumGnVT4",
  "selenium automation",
  "web scraping",
  "https://www.youtube.com/watch?v=3H8xCyjQykQ",
  "https://www.youtube.com/watch?v=1u3jXdkwLdQ",
  "https://www.youtube.com/watch?v=Fux6JsEe1ZU",
  "what is one click",
  "what is recaptcha"
];

const drivers = [];
const crt_tasks = [];
let min_slp = 20;
let max_slp = 40;
let min_run = 15;
let max_run = 25;
let max_profiles = 1;
let paused_profiles = 0;
let running_profiles = 0;
let gsearch = true;
let youtube = true;
let youtube_duration_min = 4;
let youtube_duration_max = 4;
let gsearch_duration_min = 0.05;
let gsearch_duration_max = 0.2;
let total_loop = 1;

const webdriver = require("selenium-webdriver");
const proxy = require("selenium-webdriver/proxy");
const chrome = require("selenium-webdriver/chrome");
const By = webdriver.By;
const until = webdriver.until;
const options = new chrome.Options();
const Key = webdriver.Key;
options.addArguments("window-size=800,1167");
options.addArguments("disable-web-security");
options.addArguments("allow-running-insecure-content");
options.addArguments("--log-level=3");
options.addArguments("--disable-infobars");
options.addArguments(
  "user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36"
);

const service = new chrome.ServiceBuilder(require("chromedriver").path).build();
chrome.setDefaultService(service);

app.use(bodyParser());

let interval;
let mySocket = null;
io.on("connection", socket => {
  console.log("New client connected");
  mySocket = socket;
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

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

server.listen(port, () => console.log(`Listening on port ${port}`));

let tasks = tress((task, callback) => {
  const capabilities = webdriver.Capabilities.chrome();
  capabilities.setPageLoadStrategy("none");

  const builder = new webdriver.Builder()
    .forBrowser("chrome")
    .withCapabilities(capabilities)
    .setChromeOptions(options);

  if (task.proxy !== "None") {
    builder.setProxy(
      proxy.manual({
        bypass: ["*peerh.com"],
        http: task.proxy,
        https: task.proxy
      })
    );
  }

  const driver = builder.build();
  drivers.push({ email: task.email, driver });

  function domCheck(type) {
    return new Promise(function(resolve, reject) {
      var rscheck = setInterval(function() {
        driver.executeScript("return document.readyState").then(function(rs) {
          if (type == undefined) {
            if (rs == "interactive" || rs == "complete") {
              clearInterval(rscheck);
              resolve(rs);
            }
          } else {
            if (type == "complete") {
              if (rs == "complete") {
                clearInterval(rscheck);
                resolve(rs);
              }
            } else if (type == "interactive") {
              if (rs == "interactive") {
                clearInterval(rscheck);
                resolve(rs);
              }
            }
          }
        });
      }, 1000);
    });
  }

  async function login() {
    console.log("login start ...", task.email, task.password);

    try {
      await driver.get(
        "https://accounts.google.com/signin/v2/identifier?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2FManageAccount&followup=https%3A%2F%2Faccounts.google.com%2FManageAccount&flowName=GlifWebSignIn&flowEntry=ServiceLogin"
      );
      await domCheck("complete");
      console.log("inputing credentials...", task.email);
      await driver.wait(until.elementLocated(By.id("identifierId")));
      await driver.sleep(1000);
      try {
        await driver
          .findElement({ id: "identifierId" })
          .sendKeys(task.email, Key.RETURN);
      } catch (e) {
        await driver.wait(until.elementLocated(By.id("identifierId")));
        await driver.sleep(1000);
        await driver
          .findElement({ id: "identifierId" })
          .sendKeys(task.email, Key.RETURN);
      }

      await driver.wait(
        until.elementLocated(
          By.xpath('//*[@id="password"]/div[1]/div/div[1]/input')
        )
      );
      await driver.sleep(1000);

      const inputPassword = () => {
        return new Promise((res, rej) => {
          const id = setInterval(async () => {
            try {
              await driver
                .findElement(
                  By.xpath('//*[@id="password"]/div[1]/div/div[1]/input')
                )
                .sendKeys(task.password, Key.RETURN);
              clearInterval(id);
              res(true);
            } catch (e) {}
          }, 1000);
        });
      };

      await inputPassword();
      await domCheck("complete");

      console.log("inputed credentials...", task.email);
      await driver.wait(
        until.elementLocated({ css: 'figure[class="HJOYV HJOYVi11 Vz93id"]' })
      );
      console.log("login success", task.email);
      await driver.sleep(3000);

      setTimeout(() => stopTask(task), randomMsSec(min_run, max_run));
      mySocket.emit("actionLog", {
        email: task.email,
        status: "Marinating"
      });
      const targets = myTargets.slice(0);
      for (let i = 0; i < total_loop; i += 1) {
        task.currentTarget = 0;
        while (task.currentTarget < targets.length) {
          const target = targets[task.currentTarget];
          await driver.wait(() =>
            driver.getCurrentUrl().then(url => url !== "https://a.com/")
          );
          if (target.includes("https://www.youtube.com") && youtube) {
            console.log(
              "youtube video watching ....",
              target,
              task.email,
              Date(Date.now())
            );
            await driver.get(target);
            await domCheck("complete");
            await driver.sleep(
              randomMsSec(youtube_duration_min, youtube_duration_max)
            );
          } else if (gsearch) {
            console.log(
              "Google bulk ad keyword searching ....",
              target,
              task.email,
              Date(Date.now())
            );
            await driver.get("https://www.google.com");
            await domCheck("complete");
            await driver.wait(until.elementLocated(By.name("q")));
            await driver.sleep(500);
            let input;
            try {
              input = await driver.findElement(By.name("q"));
              input.sendKeys(target, Key.RETURN);
            } catch (e) {
              await driver.wait(until.elementLocated(By.name("q")));
              await driver.sleep(1000);
              input = await driver.findElement(By.name("q"));
              input.sendKeys(target, Key.RETURN);
            }

            await domCheck("complete");
            await driver.wait(until.elementLocated(By.name("q")));
            await driver.sleep(500);
            const srch = await driver.findElement(By.name("q"));

            for (let j = 0; j < parseInt(Math.random() * 2 + 2); j++) {
              await driver
                .actions()
                .move({
                  origin: srch,
                  duration: 3000,
                  x: parseInt(Math.random() * 200),
                  y: parseInt(Math.random() * 300)
                })
                .perform();
              //await driver.actions().keyDown("CONTROL");
              console.log("moved once");
              await driver.sleep(
                randomMsSec(gsearch_duration_min, gsearch_duration_max)
              );
            }
          }

          task.currentTarget++;
        }
      }

      console.log("logging out ....");
      for (let i = 0; i < 3; i++) {
        await driver.executeScript("window.scrollBy(200, 0)", "");
        await driver.sleep(100);
      }
      await driver.sleep(500);
      console.log("waiting ....");
      await driver.wait(
        until.elementLocated({ css: 'a[class="gb_x gb_Ea gb_f"]' })
      );
      await driver.findElement({ css: 'a[class="gb_x gb_Ea gb_f"]' }).click();
      await driver.sleep(1000);
      await driver.findElement({ id: "gb_71" }).click();
      await domCheck("complete");
      await driver.sleep(2000);
      crt_tasks.splice(crt_tasks.findIndex(tsk => tsk.email === task.email), 1);
      drivers.splice(
        drivers.findIndex(driver => driver.email === task.email),
        1
      );
      driver.close();
      running_profiles--;
      callback(null, task.email);
    } catch (e) {
      callback("Error: " + e + "occured in processing ", task.email);
    }
  }

  login();
}, 1000);

tasks.drain = () => {
  console.log("Finished");
};

tasks.error = (err, email) => {
  console.log(err + email);
  crt_tasks.splice(crt_tasks.findIndex(tsk => tsk.email === email), 1);
  drivers.splice(drivers.findIndex(driver => driver.email === email), 1);
};

tasks.success = email => {
  console.log("One click completed for ", email);
  mySocket.emit("actionLog", {
    email,
    status: "Scheming"
  });
};

randomMsSec = (min, max) => {
  return (Math.random() * (max - min) + min) * 60 * 1000;
};

startTask = async task => {
  const index = crt_tasks.findIndex(tsk => tsk.email === task.email);
  running_profiles++;
  if (index === -1) {
    console.log("starting task ....", task.email);
    task.currentTarget = 0;
    tasks.push(task);
    crt_tasks.push(task);
  } else {
    console.log("resuming task ....", task.email);
    mySocket.emit("actionLog", {
      email: task.email,
      status: "Marinating"
    });
    paused_profiles--;
    const index = drivers.findIndex(driver => driver.email === task.email);
    if (index === -1) {
      console.log("cannot find driver specified", task.email);
      return;
    }
    drivers[index].driver.executeScript("window.close();");
    const handles = await drivers[index].driver.getAllWindowHandles();
    drivers[index].driver.switchTo().window(handles[0]);
    setTimeout(() => stopTask(task), randomMsSec(min_run, max_run));
  }
};

stopTask = async task => {
  const index = drivers.findIndex(driver => driver.email === task.email);
  if (index === -1) {
    return [false, "The specified task does not exist"];
  }

  try {
    console.log("pausing task ....", task.email);
    mySocket.emit("actionLog", {
      email: task.email,
      status: "Napping"
    });
    drivers[index].driver.executeScript('window.open("https://a.com/");');
    await drivers[index].driver.sleep(1000);
    const handles = await drivers[index].driver.getAllWindowHandles();
    drivers[index].driver.switchTo().window(handles[1]);

    setTimeout(
      () =>
        waitUntil()
          .interval(1000)
          .times(36000)
          .condition(() => running_profiles < max_profiles)
          .done(() => {
            if (drivers.findIndex(driver => driver.email === task.email) !== -1)
              startTask(task);
          }),
      randomMsSec(min_slp, max_slp)
    );
    paused_profiles++;
    running_profiles--;
    return [true, "Successfully stopped"];
  } catch (e) {
    return [false, err];
  }
};

setDuration = (type, duration) => {
  if (type === "slp") {
    min_slp = duration.min;
    max_slp = duration.max;
  } else {
    min_run = duration.min;
    max_slp = duration.max;
  }
};

setMaxProfiles = cnt => {
  max_profiles = cnt;
};

setSettings = (duration, maxProfile, gs, yt) => {
  setDuration("slp", duration.sleep);
  setDuration("run", duration.run);
  setMaxProfiles(maxProfile);
  gsearch = gs;
  youtube = yt;
};

app.post("/addtask", async (req, res) => {
  waitUntil()
    .interval(1000)
    .times(36000)
    .condition(() => running_profiles < max_profiles)
    .done(() => startTask(req.body.task));
  res.send("Successfully started");
});

app.post("/stoptask", async (req, res) => {
  const result = stopTask(req.body.task);
  if (!result[0]) {
    res.status(500).send(result[1]);
  } else {
    res.send(result[1]);
  }
});

app.post("/changesetting", (req, res) => {
  setSettings(
    req.body.duration,
    req.body.maxProfile,
    req.body.gsearch,
    req.body.youtube
  );
  res.send("Successfully set task settings");
});

app.post("/changetargets", (req, res) => {
  myTargets = req.body.targets;
  res.send("Successfully set targets");
});
