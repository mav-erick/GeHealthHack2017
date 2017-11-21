var express = require('express');
var passport = require('passport');
var Account = require('../models/users');
var User = require('../models/userDetails');
var Service = require('../models/services');
var router = express.Router();
var zerorpc = require("zerorpc");
var msgpack = require('msgpack5')();
var otp = "";
var user_details = "";
var neo4j = require('neo4j-driver').v1;

router.get('/', function (req, res) {
	var db = req.app.get('db');
	
	/*
	//remove existing entries
	Service.remove({}, function(err, conf) {
		if (err) console.log(err);
		else console.log(conf);
	});
	
	//dummy insertions
	var job_list = [{name : 'Carpenter', type : '1'}, {name : 'Beautician', type : '1'}, {name : 'Plumber', type : '1'}, {name : 'Painter', type : '1'}, {name : 'Stone Mason', type : '1'}];

	Service.insertMany(job_list, function (err, jobs) {
		if (err) console.log(err);
		console.log(jobs);
	});
	*/

	var client = new zerorpc.Client();
	client.connect("tcp://127.0.0.1:4040");
	client.invoke("Trendingdisease", function(err, resp) {
		if (err) {
			console.log(err);
		} else {
			for (var i=0; i < Object.keys(resp).length; i++) {
				resp[i] = resp[i].toString();
			}
			JSON.stringify(resp);
			//console.log(resp);
			var trending = resp;
			client.invoke("who_india_news", function(err, respo) {
				if (err) {
					console.log(err);
				} else {
					for (var i=0; i < Object.keys(respo).length; i++) {
						respo[i] = respo[i].toString();
					}
					JSON.stringify(respo);
					//console.log(resp);
					var news = respo;
					//console.log(news);
					//console.log(trending);
					client.invoke("DataStatistics", function(err, respon) {
						if (err) {
							console.log(err);
						} else {
							for (var i=0; i < Object.keys(respon).length; i++) {
								respon[i] = respon[i].toString();
							}
							JSON.stringify(respon);
							//console.log(resp);
							var stats = respon;
							console.log(stats);
							//console.log(news);
							//console.log(trending);
							res.render('index', { news : news, trending : trending, stats : stats, page_id : 'home', user : req.user});
						}
					});
				}
			});
		}
	});
});

router.post('/signup', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.send(err);
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/user-details');
        });
    });
});

router.post('/user-details', function(req, res) {
	
	if (req.user) {
		var user = new User({name:req.body.name, username:req.user.username, email: req.body.email, hospital:req.body.hospital, designation: req.body.designation});
		user.save();	
		res.redirect('/');
	}
}); 

router.post('/login', passport.authenticate('local'), function(req, res) {
	var backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/about', function(req, res){
	var db = req.app.get('db');
	var service_id = req.params.service;
	Service.find({}, function(err, services) {
		if (err) console.log(err);
		else {
			console.log(services);
			res.render('about', { user : req.user, services : services, page_id : "about" });
		}
	});
});

router.get('/contact', function(req, res){
	res.render('contact', { user : req.user, page_id : "contact" });
});

router.get('/signup', function(req, res){
	res.render('signup', { user : req.user, page_id : "signup" });
});

router.get('/patients', function(req, res){
	res.render('patients', { user : req.user, page_id : "patients" });
});

router.get('/user-details', function(req, res) {
	if(req.user) {
		res.render('user-details', { user : req.user, page_id : "user-details" });
	} else {
		res.redirect('/');
	}
});

router.post('/patients', function(req, res) {
	var form = req.body;	
	var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "penguin04"));
	 
	// Register a callback to know if driver creation was successful: 
	driver.onCompleted = function() {
		console.log("neo4j is on !!!");
	  // proceed with using the driver, it was successfully instantiated 
	};
	
	//console.log(form);
	// Register a callback to know if driver creation failed. 
	// This could happen due to wrong credentials or database unavailability: 
	driver.onError = function(error) {
  		console.log('Driver instantiation failed', error);
	};
	console.log(form.name);
	var session = driver.session();
	var rec = [];
	session
	.run("MATCH (nodes) WHERE nodes.disease = {diseaseParam} RETURN nodes.name, nodes.symptoms, nodes.disease, nodes.treatment ", { diseaseParam: form.diagnosis })
	.subscribe({
		onNext: function (record) {
	  		console.log(record._fields);
	  		rec.push(record._fields);
	  	},
		onCompleted: function() {
		  	// Completed!
		  	session.close();

			var client = new zerorpc.Client({timeout : 3000});
			client.connect("tcp://127.0.0.1:4242");
			var diagnosis = form.diagnosis;
			client.invoke("func", diagnosis, function(err, resp) {
				if (err) {
					console.log(err);
					res.redirect('/');
				} else {
					JSON.stringify(resp);
					console.log(resp);
					res.render('patients-results', { user : req.user, patients : rec, diseases : resp, page_id : "patients-results" });
				}
			});
		},
		onError: function(error) {
		  	console.log(error);
		}
	});
});

router.post('/patient-add', function(req, res) {
	var form = req.body;	
	var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "penguin04"));
	 
	// Register a callback to know if driver creation was successful: 
	driver.onCompleted = function() {
		console.log("neo4j is on !!!");
	  // proceed with using the driver, it was successfully instantiated 
	};
	
	//console.log(form);
	// Register a callback to know if driver creation failed. 
	// This could happen due to wrong credentials or database unavailability: 
	driver.onError = function(error) {
  		console.log('Driver instantiation failed', error);
	};
	console.log(form.name);
	var session = driver.session();
	var rec = [];
	session
	.run("CREATE (n:patient {name : {nameParam}, age : {ageParam}, bmi : {bmiParam}, gender :  {genderParam}, illnesses : {illnessesParam}, symptoms : {symptomsParam}, dagnosis : {diagnosisParam}, treatment: {treatmentParam}}) RETURN n", { nameParam : form.name, ageParam:form.age, bmiParam : form.bmi, genderParam:form.gender, illnessParam:form.illness, symptomsParam:form.symptoms, treatmentParam : form.treatment, diagnosisParam: form.diagnosis })
	.subscribe({
		onNext: function (record) {
	  		console.log(record._fields);
	  		rec.push(record._fields);
	  	},
		onCompleted: function() {
		  	// Completed!
		  	session.close();
			res.redirect('/patients');
		},
		onError: function(error) {
		  	console.log(error);
		}
	});
});


router.get('/dummy-data', function(req, res) {
	res.render('dummy-data', {user : req.user, page_id : 'patients' });
});

router.post('/search-results', function(req, res){
	var client = new zerorpc.Client({timeout : 3000});
	client.connect("tcp://127.0.0.1:4141");
	var search = req.body.search;
	client.invoke("func", search, function(err, resp) {
		if (err) {
			console.log(err);
			res.redirect('/');
		} else {
			JSON.stringify(resp);
			console.log(resp);
			res.render('search-results', { user : req.user, links : resp, page_id : "search-results" });
		}
	});
});

router.get('/:service', function(req, res){
	var db = req.app.get('db');
	var service_id = req.params.service;
	Service.find({}, function(err, services) {
		if (err) console.log(err);
		else {
			console.log(services);
			res.render('handyman', { user : req.user, services : services, page_id : service_id });
		}
	});
});

module.exports = router;