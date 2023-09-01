var express = require('express');
var router = express.Router();
var Fuse = require('fuse.js')

const db = require('./db.json')

let idx = require('./name-index.json')
const nameIndex = Fuse.parseIndex(idx)
const nameOptions = {
	keys: [
		"card_name",
	]
};

const nameFuse = new Fuse(db, nameOptions, nameIndex)

idx = require('./set-index.json')
const setIndex = Fuse.parseIndex(idx)
const setOptions = {
	keys: [
		"card_sets",
	]
};

const setFuse = new Fuse(db, setOptions, setIndex)

router.get('/', function(req, res, next) {
  	res.render('search', { name: '? type here to search', result: [] });
});

router.get('/:name', function(req, res, next) {
	if(req.params.name.length == 10 &&  req.params.name[4] == '-') {
		search = [setFuse.search(req.params.name)[0]]
	} else {
		search = nameFuse.search(req.params.name).slice(0, 10)
	}
  	res.render('search', { name: req.params.name, result: search });
});

module.exports = router;
