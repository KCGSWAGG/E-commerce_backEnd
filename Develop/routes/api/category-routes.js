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


router.put('/categories/:id', async (req, res) => {
  // Update a category by its `id` value
  try {
    await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (req.body.productIds && req.body.productIds.length > 0) {
      const products = await Product.findAll({
        where: { category_id: req.params.id },
      });

      const existingProductIds = products.map(({ id }) => id);
      const newProductCategories = req.body.productIds
        .filter((product_id) => !existingProductIds.includes(product_id))
        .map((product_id) => ({
          category_id: req.params.id,
          product_id,
        }));

      const productCategoriesToRemove = products
        .filter(({ id }) => !req.body.productIds.includes(id))
        .map(({ id }) => id);

      await Promise.all([
        ProductCategory.destroy({ where: { id: productCategoriesToRemove } }),
        ProductCategory.bulkCreate(newProductCategories),
      ]);
    }

    const updatedCategory = await Category.findByPk(req.params.id);
    console.log('Category updated:', updatedCategory.id);
    res.status(200).json(updatedCategory);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'server error' });
  }
});


router.delete('/categories/:id', async (req, res) => {
  // Delete a category by its `id` value
  try {
    const deleteCategoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (deleteCategoryData === 0) {
      res.status(404).json({ message: 'No category found with that id! Deletion unsuccessful.' });
      return;
    }

    console.log('Category deleted:', req.params.id);
    res.status(200).json(deleteCategoryData);
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'server error' });
  }
});


module.exports = router;
