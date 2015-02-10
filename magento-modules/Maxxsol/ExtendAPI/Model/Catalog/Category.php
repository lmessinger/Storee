<?php

/**
 * Description of Maxxsol_ExtendAPI_Model_Catalog_Category
 *
 * @author Makki
 */
class Maxxsol_ExtendAPI_Model_Catalog_Category extends Mage_Api2_Model_Resource {

    function getTreeCategories($parentId, $offset = 1, $limit = 10) {
        $rootCategoryId = Mage::app()->getStore(1)->getRootCategoryId();
        $parentId = $parentId ? $parentId : $rootCategoryId;
        
        $allCats = Mage::getModel('catalog/category')
                ->getCollection()
                ->addAttributeToSelect('*')
                ->addAttributeToFilter('is_active', '1')
                ->addAttributeToFilter('include_in_menu', '1')
                ->addAttributeToFilter('parent_id', array('eq' => $parentId))
                ->addAttributeToSort('position', 'asc')
                ->setPageSize($limit)
                ->setCurPage($offset);

        $categories = array();

        foreach ($allCats as $category) {
            $categories[] = array(
                'id' => (int) $category->getId(),
                'name' => $category->getName(),
                'slug' => $category->getUrlKey(),
                'blockId' => (int) $category->getLandingPage(),
                'children' => $this->getTreeCategories($category->getId())
            );
        }

        return $categories;
    }

    function getAllCategoriesWithProducts() {
        $rootCategoryId = Mage::app()->getStore(1)->getRootCategoryId();

        $allCats = Mage::getModel('catalog/category')
                ->getCollection()
                ->addAttributeToSelect('*')
                ->addAttributeToFilter('is_active', '1')
                ->addAttributeToFilter('include_in_menu', '1')
                ->addAttributeToFilter('parent_id',
                        array('eq' => $rootCategoryId))
                ->addAttributeToSort('position', 'asc');

        $categories = array();

        foreach ($allCats as $category) {
            $categories[] = array(
                'id' => (int) $category->getId(),
                'name' => $category->getName(),
                'slug' => $category->getUrlKey(),
                'blockId' => (int) $category->getLandingPage(),
                'products' => $this->getProductsByCategory($category->getId())
            );
        }

        return $categories;
    }

    function getProductsByCategory($cat_id) {

        $category = Mage::getModel('catalog/category')->load($cat_id);

        $products = Mage::getResourceModel('catalog/product_collection')
                ->setStoreId(1)
                ->addAttributeToFilter(
                        'status',
                        array('eq' => Mage_Catalog_Model_Product_Status::STATUS_ENABLED)
                )
                ->addAttributeToFilter('visibility',
                        Mage_Catalog_Model_Product_Visibility::VISIBILITY_BOTH)
                ->addCategoryFilter($category);

        $productIds = array();

        try {
            $rank = 1;
            foreach ($products as $product) {
                $product = Mage::getModel('catalog/product')->load($product->getId());
                $slug = $product->getUrlKey();
                if (empty($slug)) {
                    $slug = $product->formatUrlKey($product->getName());
                }
                $productIds[] = array(
                    'entity_id' => $product->getId(),
                    'rank' => $rank++,
                    'name' => $product->getName(),
                    'title' => $product->getShortDescription(),
                    'desc' => $product->getDescription(),
                    'regular_price' => $product->getPrice(),
                    'final_price' => $product->getFinalPrice(),
                    'slug' => $slug,
                    'thumb_url' => $product->getThumbnailUrl(200, 60),
                    'image_url' => Mage::getModel('catalog/product_media_config')->getMediaUrl($product->getImage()),
                    'product_url' => $product->getProductUrl()
                );
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
        }

        return $productIds;
    }

}
