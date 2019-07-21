const io = require("./local-io");
const fs = require("fs");
const maps = require("./maps");
const jsonCSVParser = require("json2csv").parse;

const formats = {
  aiomoji: {
    loadFile: io.csv.load,
    saveFile: io.csv.save
  },
  defJSON: {
    loadFile: io.json.load,
    saveFile: io.json.load
  },
  anbaio: {
    loadFile: io.csv.load,
    saveFile: io.csv.save
  },
  balko: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  bnb: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  candypreme: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  cinnasole: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  cyber: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  dashev3: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  eveaio: {
    loadFile: io.xml.load,
    saveFile: io.xml.save
  },
  hastey: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  kodai: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  oculus: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  pd: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  phantom: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  prism: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  profiles: {
    loadFile: function(fileName, cb) {
      let data = fs.readFileSync(fileName, "utf-8");
      let json = data.split(";").map(JSON.parse);
      cb(json);

      return json;
    },

    saveFile: function(fileName, data) {
      var raw = data.map(item => JSON.stringify(item, null, 2)).join(";");
      fs.writeFileSync(fileName, raw);
    }
  },
  sneaker_copter: {
    loadFile: function(fileName, cb) {
      var origCSV = fs.readFileSync(fileName);
      var headers = [
        "ProfileName",
        "StateBilling",
        "Address1Shipping",
        "Address1Billing",
        "CityBilling",
        "FirstNameBilling",
        "LastNameBilling",
        "PhoneBilling",
        "ZipCodeBilling",
        "CountryBilling",
        "CardSecurityCode",
        "CardNumber",
        "CardExpirationMonth",
        "CardExpirationYear",
        "Email",
        "CountryBillingShort"
      ];
      headerCSV = headers.join(",") + "\n" + s;

      var rows = [];
      csv
        .fromString(CSV_STRING, { headers: true })
        .on("data", row => rows.push(row))
        .on("end", () => {});
    },
    saveFile: function(fileName, data) {
      const fields = Object.keys(data[0]);
      const opts = { fields, quote: "", header: false };

      try {
        const csv = jsonCSVParser(data, opts);
        fs.writeFileSync(fileName, csv);
      } catch (err) {
        console.error(err);
      }
    }
  },
  sole_terminator: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  soleaio: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  whatbot: {
    loadFile: io.db.load,
    saveFile: io.db.save
  },
  yitan: {
    loadFile: io.zip.load,
    saveFile: io.zip.save
  },
  NSB: {
    loadFile: io.json.load,
    saveFile: io.json.save
  },
  TKS: {
    loadFile: io.json.load,
    saveFile: io.json.save
  }
};

function defaultRemap(data) {
  return data;
}

function intoDefault(input, map) {
  var def = input;
  return def;
}

function fromDefault(def, map) {
  var output = def;
  return output;
}

function convert(sourceFile, targetFile, sourceFormatName, targetFormatName) {
  if (!formats.hasOwnProperty(sourceFormatName))
    throw "Unknown format" + sourceFormatName;
  if (!formats.hasOwnProperty(targetFormatName))
    throw "Unknown format" + targetFormatName;
  let sourceFormat = formats[sourceFormatName];
  let targetFormat = formats[targetFormatName];
  let sourceMap = maps[sourceFormatName];
  let targetMap = maps[targetFormatName];

  sourceFormat.loadFile(sourceFile, function(sourceDataRaw) {
    sourceData = sourceMap.hasOwnProperty("unpack")
      ? sourceMap.unpack(sourceDataRaw)
      : sourceDataRaw;
    var defaultData = sourceData.map(row =>
      maps[sourceFormatName].intoDefault(row, maps[sourceFormatName])
    );
    var resultDataRaw = defaultData.map(row =>
      maps[targetFormatName].fromDefault(row, maps[targetFormatName])
    );
    resultData = targetMap.hasOwnProperty("pack")
      ? targetMap.pack(resultDataRaw)
      : resultDataRaw;
    //console.log(resultData)
    targetFormat.saveFile(targetFile, resultData);
  });
}

module.exports = { convert };
