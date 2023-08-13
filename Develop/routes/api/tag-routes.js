const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/tags', async (req, res) => {
  // find all tags
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }],
    });

    console.log('Showing all tags.');
    res.status(200).json(tagData);
  } catch (err) {
    console.error('Error while getting all tags:', err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
   try {
    const singleTagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!singleTagData) {
      res.status(404).json({ message: 'No tag found' });
      return;
    }

    console.log('Showing one tag by ID.');
    res.status(200).json(singleTagData);
  } catch (err) {
    console.error('Error while fetching tag:', err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/', (req, res) => {
  // create a new tag
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;
