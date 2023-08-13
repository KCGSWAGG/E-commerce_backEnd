const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    console.log('Showing all products.');
    res.status(200).json(productData);
  } catch (err) {
    console.error('Error while fetching all products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const singleProductData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }], // be sure to include its associated Category and Tag data
    });

    if (!singleProductData) {
      res.status(404).json({ message: 'No product found!' });
      return;
    }

    res.status(200).json(singleProductData);
    console.log('Showing Product with ID.');
  } catch (err) {
    res.status(500).json(err);
    console.log('server error: No Product');
  }
});

// create new product
router.post('/', async (req, res) => {
    
    try {
      const newProduct = await Product.create(req.body);
  
      if (req.body.tagIds && req.body.tagIds.length > 0) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => ({
          product_id: newProduct.id,
          tag_id,
        }));
        await ProductTag.bulkCreate(productTagIdArr);
      }
  
      console.log('New product created:', newProduct.id);
      res.status(200).json(newProduct);
    } catch (err) {
      console.error('Could not make product', err);
      res.status(500).json({ error: 'server error' });
    }
  });

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
});

module.exports = router;
