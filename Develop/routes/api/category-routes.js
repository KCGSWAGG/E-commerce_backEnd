const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/categories', async (req, res) => {
  // Find all categories
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });

    console.log('Showing categories.');
    res.status(200).json(categoryData);
  } catch (err) {
    console.error('Error fetching all categories:', err);
    res.status(500).json({ error: 'server error' });
  }
});


router.get('/:id', (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
});

router.post('/', (req, res) => {
  // create a new category
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
});

module.exports = router;
