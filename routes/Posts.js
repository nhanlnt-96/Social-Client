const express = require('express');
const router = express.Router();
const {Posts, Likes} = require('../models');
const {validateToken} = require('../middleware/jwt');


//create post
router.post('/', validateToken, async (req, res) => {
  const post = req.body;
  post.username = req.user.username;
  post.UserId = req.user.id;
  await Posts.create(post);
  res.json(post);
});

//get post
router.get('/', validateToken, async (req, res) => {
  const allPosts = await Posts.findAll({include: [Likes]});

  const likedPosts = await Likes.findAll({where: {UserId: req.user.id}})
  res.json({allPosts, likedPosts});
});

//individual pages base on ID
router.get('/post-by-id/:id', async (req, res) => {
  const id = req.params.id;
  const postById = await Posts.findByPk(id, {include: [Likes]});
  res.json(postById);
});

router.get('/post-by-user/:id', async (req, res) => {
  const id = req.params.id;
  const postByUser = await Posts.findAll({where: {UserId: id}, include: [Likes]});
  res.json(postByUser);
});

//delete post
router.delete('/:postId', validateToken, async (req, res) => {
  const postId = req.params.postId;
  await Posts.destroy({where: {id: postId}});
  res.json('Post deleted');
});

//edit post
router.put('/edit-post', validateToken, async (req, res) => {
  const {newPostText, id} = req.body;
  await Posts.update({postText: newPostText}, {where: {id: id}});

  res.json(newPostText);
});

module.exports = router;