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


router.get('/categories/:id', async (req, res) => {
  // Find one category by its `id` value
  try {
    const singleCategoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!singleCategoryData) {
      res.status(404).json({ message: 'No category found' });
      return;
    }

    console.log('Showing one category by ID.');
    res.status(200).json(singleCategoryData);
  } catch (err) {
    console.error('Error fetching category by ID:', err);
    res.status(500).json({ error: 'server error' });
  }
});


router.post('/categories', async (req, res) => {
  // Create a new category
  try {
    const newCategory = await Category.create(req.body);

    // If there are product IDs, create associations with ProductCategory
    if (req.body.productIds && req.body.productIds.length > 0) {
      const categoryIdArr = req.body.productIds.map((product_id) => ({
        category_id: newCategory.id,
        product_id,
      }));
      await ProductCategory.bulkCreate(categoryIdArr);
    }

    console.log('New category created:', newCategory.id);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'server error' });
  }
});


router.put('/:id', (req, res) => {
  // update a category by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
});

module.exports = router;
