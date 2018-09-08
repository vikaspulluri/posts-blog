const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + '/images/' + req.file.filename,
      creator: req.userData.userId
  });
  post.save().then((result) => {
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        ...result,
        id: result._id,
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Creating a post failed!!!'
    });
  });
}

exports.updatePost = (req, res, next) => {
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
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then((result) => {
    if(result.n > 0) {
      res.status(200).json({message: 'Updated successfully'});
    } else {
      res.status(401).json({message: 'Not Authorized to update the post'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Could not update the post!!!'
    });
  });
}

exports.getPosts = (req, res, next) => {
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
      .catch(error => {
        res.status(500).json({
          message: 'Fetching posts failed!!!'
        });
      });
}

exports.getPostById = (req, res, next) => {
  Post.findById(req.params.id).then(
    post => {
      if(post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({message: 'Post Not Found!!!'});
      }
    }
  )
  .catch(error => {
    res.status(500).json({
      message: 'Fetching a post failed!!!'
    });
  });
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result => {
    if(result.n > 0) {
      res.status(200).json({message: 'Post deleted successfully'});
    } else {
      res.status(401).json({message: 'Not Authorized to delete the post'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Deleting the post failed!!!'
    });
  });
}
