
const expect = require('chai').expect;

var error_handler = err=>console.log("something went wrong: ", err.message);

var config = {
	host: '127.0.0.1', 
	user: 'root', 
	password: '', 
	database: 'testdb',
	onerror: error_handler
};

const con = require('mysql').createConnection({
	host: config.host, 
	user: config.user, 
	password: config.password
});

const importer = require('../mysql-import.js').config(config);

const query = sql => new Promise(done=>{
	con.query(sql, (err, result)=>{
		if(err) error_handler(err);
		else done(result);
	});
});

var startTime = new Date().getTime();

console.log("Creating test DB");
query("create database if not exists testdb").then(()=>query("use testdb")).then(()=>{
	
	console.log("Importing test dump");
	importer.import('test.sql').then(()=>{
		
		query("select * from importtest").then(res=>{
			console.log(`${res.length} rows inputted.`);
			
			query("select * from importtest where doc like \"%;%\"").then(res=>{
				console.log(`There are ${res.length} entries with a semicolon.`);

				query("drop database testdb").then(()=>{
					var time = new Date().getTime() - startTime;
					console.log("test complete in "+time+"ms");					
					process.exit();
				});

			});
			
		});
		
	});
});

