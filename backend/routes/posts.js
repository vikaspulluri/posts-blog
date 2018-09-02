const express = require('express');
const multer = require('multer');

const Post = require('../models/post');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid MIME Type');
    if(isValid){
      error = null;
    }
    cb(error, 'backend/images')
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const extension = MIME_TYPE_MAP[file.mimetype];
    //error first callback
    cb(null, name + '-' + Date.now() + '.' + extension)
  }
});

router.post('/', multer({storage: storage}).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + '/images/' + req.file.filename
  });
  post.save().then((result) => {
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        ...result,
        id: result._id,
      }
    });
  });
});

router.put('/:id', multer({storage: storage}).single('image'), (req, res, next) => {
  let imagePath = req.body.imagePath;
  //request path is a undefined if it is a string
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  Post.updateOne({_id: req.params.id}, post).then((result) => {
    res.status(200).json({message: 'Updated successfully'});
  });
});

router.get('/', (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedDocs;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1))
              .limit(pageSize);
  }
  postQuery
      .then((documents) => {
        fetchedDocs = documents;
        return Post.count();
      })
      .then(count => {
        res.status(200).json({
          message: 'posts fetched successfully',
          posts: fetchedDocs,
          totalPosts: count
        });
      })
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then(
    post => {
      if(post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({message: 'Post Not Found'});
      }
    }
  )
});

router.delete('/:id', (req, res, next) => {
  Post.deleteOne({_id: req.params.id}).then(result => {
    res.status(200).json({message: 'Post deleted'});
  })
});

module.exports = router;