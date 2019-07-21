const JSZip = require("jszip");
const csv = require('fast-csv');
const fs = require('fs');
const unzip = require('unzip');
const xml2js = require('xml2js');
const xmlParser = (new xml2js.Parser({ attrkey: "ATTR"})).parseString;
const jsonCSVParser = require('json2csv').parse;

const io = {
	csv : {
		load: function (fileName, cb) {
			var rows = [];
			fs.createReadStream(fileName)
			  .pipe(csv.parse({ headers: true }))
			  .on('data', row => rows.push(row))
			  .on('end', () => cb(rows))
		},

		save: function (fileName, data) {
			const fields = Object.keys(data[0]);
			const opts = { fields, quote:''};

			try {
			  const csv = jsonCSVParser(data, opts);
			  fs.writeFileSync(fileName, csv);
			} catch (err) {
			  console.error(err);
			}

		}
	},

	json: {
		load: function (fileName, cb) {
			let data = fs.readFileSync(fileName);
			let json = JSON.parse(data);

			cb(json);

			return json;
		},

		save: function (fileName, data) {
			var json = JSON.stringify(data, null, 2);
			fs.writeFileSync(fileName, json);
		}
	},

	db: {
		load: function (fileName, cb) {
			let s = fs.readFileSync(fileName, 'utf-8');
			let lines = s.split('\n');
			let json = lines.map(JSON.parse);
			cb(json);
		},

		save: function (fileName, data) {
			let json = data.map(JSON.stringify).join('\n');
			fs.writeFileSync(fileName, json);
		}
	},

	xml : {
		load: function (fileName, cb) {
			let string = fs.readFileSync(fileName, 'utf8');

			xmlParser(string, function(error, result) {
			    if(error === null) {
			        cb(result);
			    }
			    else {
			        throw 'LOAD XML ' + fileName + ' error: ' + error;
			    }
			});
		},
		save: function (fileName, data) {
			var builder = new xml2js.Builder();
			var xml = builder.buildObject(data);
			fs.writeFileSync(fileName, xml);
		}
	},
	zip : {
		load: function (fileName, cb) {
			var items = [];
			fs.createReadStream(fileName)
				.pipe(unzip.Parse())
				.on('entry', function (entry) {
					if (entry.path.match(/\.json$/)) {
					  var s = '';
					  entry
						  .on('data', chunk => s += chunk)
						  .on('end', () => {
						  	items.push(JSON.parse(s));
						  })
					  ;
					} else {
					  entry.autodrain();
					}
				})
				.on('close', () => cb(items))
		},
		save: function (fileName, data) {
			var zip = new JSZip();
			 
			function makeid(length) {
			   var result           = '';
			   var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
			   var charactersLength = characters.length;
			   for ( var i = 0; i < length; i++ ) {
			      result += characters.charAt(Math.floor(Math.random() * charactersLength));
			   }
			   return result;
			}

			data.map(item => zip.file(makeid(9) + '.json', JSON.stringify(item, null, 2)))

			zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
			   .pipe(fs.createWriteStream(fileName))
			   .on('finish', function () {
			       //console.log(fileName + " written.");
			    });
    		}
	}
}

module.exports = io;




