/* vim: set ts=2: */
var XLSX;
var fs = require('fs'), assert = require('assert');
describe('source', function() { it('should load', function() { XLSX = require('./'); }); });

var files = (fs.existsSync('tests.lst') ? fs.readFileSync('tests.lst', 'utf-8').split("\n") : fs.readdirSync('test_files')).filter(function(x){return x.substr(-5)==".xlsx" || x.substr(-13)==".xlsx.pending"});

function normalizecsv(x) { return x.replace(/\t/g,",").replace(/#{255}/g,"").replace(/"/g,"").replace(/[\n\r]+/g,"\n").replace(/\n*$/,""); }

function parsetest(x, wb) {
	describe(x + ' should have all bits', function() {
		var sname = './test_files/2011/' + x + '.sheetnames';
		it('should have all sheets', function() {
			wb.SheetNames.forEach(function(y) { assert(wb.Sheets[y], 'bad sheet ' + y); });
		});
		it('should have the right sheet names', fs.existsSync(sname) ? function() {
			var file = fs.readFileSync(sname, 'utf-8');
			var names = wb.SheetNames.join("\n") + "\n";
			assert.equal(names, file);
		} : null);
	});
	describe(x + ' should generate correct output', function() {
		wb.SheetNames.forEach(function(ws, i) {
			var name = ('./test_files/' + x + '.' + i + '.csv');
			it('#' + i + ' (' + ws + ')', fs.existsSync(name) ? function() {
				var file = fs.readFileSync(name, 'utf-8');
				var csv = XLSX.utils.make_csv(wb.Sheets[ws]);
				assert.equal(normalizecsv(csv), normalizecsv(file), "CSV badness");
			} : null);
		});
	});
}

describe('should parse test files', function() {
	files.forEach(function(x) {
		it(x, x.substr(-8) == ".pending" ? null : function() {
			var wb = XLSX.readFile('./test_files/' + x);
			parsetest(x, wb);
		});
	});
});

describe.only('should have comment as part of cell\'s properties', function(){
	var ws;
	before(function() {
		XLSX = require('./xlsx');
		var wb = XLSX.readFile('./test_files/apachepoi_SimpleWithComments.xlsx');
		var sheetName = 'Sheet1';
		ws = wb.Sheets[sheetName];
	});
	it('Parse comments.xml and insert into cell',function(){
		assert.equal(ws.B1.c.length, 1,"must have 1 comment");
		assert.equal(ws.B1.c[0].t, "Yegor Kozlov:\r\nfirst cell", "must have the concatenated texts");
		assert.equal(ws.B1.c[0].r, '<span style="font-weight: bold;">Yegor Kozlov:</span><span style=""><br/>first cell</span>', "must have the html representation");
		assert.equal(ws.B1.c[0].a, "Yegor Kozlov","must have the same author");
	it('Parse numberFormat and return rawnf into cell',function(){
		var wb = XLSX.readFile('./stoic_SimpleWithDataFormat.xlsx',{evaluateFmt:false});
		var sheetName = 'Sheet1';
		var ws = wb.Sheets[sheetName];
		assert.equal(ws.A2.rawnf,'m/d/yy h:mm:ss am/pm','rawnf must have a number format');
		assert.equal(ws.A2.raw,ws.A2.v,'raw and value is the same');
		assert.equal(ws.A2.raw, 41641.375,' raw should be this value');
	});
});
