const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js')
const fs = require('fs');
const axios = require('axios');
const db = require('./../db/db.json')
const images = require('./../db/images.json')

const download_image = async (url, image_path) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
  );

const check_image = (konami_id) => {
	let filePath =  __dirname + "/../public/images/cards/"+konami_id+".png"
	let exists = fs.existsSync(filePath)
	if (!exists) {
		download_image(images[konami_id], filePath)
	}
	return exists
}

let idx = require('./../db/name-index.json')
const nameIndex = Fuse.parseIndex(idx)
const nameOptions = {
	keys: [
		"card_name",
	]
};

const nameFuse = new Fuse(db, nameOptions, nameIndex)

idx = require('./../db/set-index.json')
const setIndex = Fuse.parseIndex(idx)
const setOptions = {
	useExtendedSearch: true,
	keys: [
		"card_sets",
	]
};

const setFuse = new Fuse(db, setOptions, setIndex)

idx = require('./../db/id-index.json')
const idIndex = Fuse.parseIndex(idx)
const idOptions = {
	useExtendedSearch: true,
	keys: [
		"konami_id",
	]
};

const idFuse = new Fuse(db, idOptions, idIndex)

router.get('/', function(req, res, next) {
  	res.render('search', { name: '? type here to search', result: [] });
});

router.get('/:name', function(req, res, next) {
	let search = []
	if(req.params.name.length == 10 &&  req.params.name[4] == '-') {
		search = setFuse.search('='+req.params.name)
	} else {
		search = nameFuse.search(req.params.name).slice(0, 10)
	}

	for(s of search) {
		s.image_exists = check_image(s.item.konami_id)	
	}

  	res.render('search', { name: req.params.name, result: search });
});

router.get('/card/:id', async function(req, res, next) {
	search = idFuse.search('='+req.params.id)
	search[0].image_exists = await check_image(search[0].item.konami_id)
  	res.render('card', { name: search[0].item.card_name, card: search[0] });
});

module.exports = router;
