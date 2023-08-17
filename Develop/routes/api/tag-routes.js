const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
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

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create(req.body);

    if (req.body.productIds && req.body.productIds.length > 0) {
      const tagIdArr = req.body.productIds.map((product_id) => ({
        tag_id: newTag.id,
        product_id,
      }));
      await ProductTag.bulkCreate(tagIdArr);
    }

    console.log('New tag made:', newTag.id);
    res.status(201).json(newTag);
  } catch (err) {
    console.error('Error while making tag:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Update tag's name by its `id` value
router.put('/:id', async (req, res) => {
  try {
    
    await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (req.body.tagIds && req.body.tagIds.length > 0) {
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      const existingProductTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !existingProductTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: req.params.id,
          tag_id,
        }));

      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    const updatedTag = await Tag.findByPk(req.params.id);
    console.log('Tag updated:', updatedTag.id);
    res.status(200).json(updatedTag);
  } catch (err) {
    console.error('Error while updating tag:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', async (req, res) => {
  // Delete a tag by its `id` value
  try {
    const deleteTagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (deleteTagData === 0) {
      res.status(404).json({ message: 'No tag found with id! cannot delete.' });
      return;
    }

    console.log('Tag deleted:', req.params.id);
    res.status(200).json(deleteTagData);
  } catch (err) {
    console.error('can not delete tag:', err);
    res.status(500).json({ error: 'server error' });
  }
});


module.exports = router;
