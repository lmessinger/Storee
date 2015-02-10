<?php

/**
 * Description of Maxxsol_ExtendAPI_Model_Catalog_Product
 *
 * @author Makki
 */
class Maxxsol_ExtendAPI_Model_Catalog_Product extends Mage_Api2_Model_Resource {

    function _getProduct($prod_id) {
        $product = Mage::getModel('catalog/product')->load($prod_id);
        $productData = array(
            'entity_id' => $product->getId(),
            'name' => $product->getName(),
            'title' => $product->getShortDescription(),
            'regular_price' => $product->getPrice(),
            'final_price' => $product->getFinalPrice(),
            'slug' => $product->getUrlKey(),
            'thumb_url' => $product->getThumbnailUrl(200, 60),
            'image_url' => Mage::getModel('catalog/product_media_config')->getMediaUrl($product->getImage()),
            'product_url' => $product->getProductUrl()
        );

        return $productData;
    }

    function _getProductOptions($prod_id) {
        Mage::app()->setCurrentStore(1);
        $product = Mage::getModel('catalog/product')->load($prod_id);
        $responseOptions = array();

        if ($product->isSuper()) {

            $configurableAttributeCollection = $product->getTypeInstance()->getConfigurableAttributes();

            /**
             * Use the collection to get the desired values of attribute 
             */
            foreach ($configurableAttributeCollection as $attribute) {
                $attributeObj = json_decode($attribute->toJson(), true);
                $option = array();

                $option['id'] = $attributeObj['attribute_id'];
                $option['name'] = 'super_attribute[' . $attributeObj['attribute_id'] . ']';
                $option['label'] = $attributeObj['label'];
                $option['type'] = 'drop_down';
                $option['price'] = $attributeObj['price'];
                $option['price_type'] = $attributeObj['price_type'];
                $option['is_super'] = 1;

                $values = array();

                foreach ($attributeObj['prices'] as $value) {
                    $values[] = array(
                        'label' => $value['label'],
                        'price' => $value['pricing_value'],
                        'price_type' => $value['is_percent'] ? 'percent' : 'fixed',
                        'value' => $value['value_index']
                    );
                }

                $option['values'] = $values;

                $responseOptions[] = $option;
            }
        }

        foreach ($product->getOptions() as $_option) {

            $option = array();

            $optionObj = json_decode($_option->toJson(), true);

            $option['id'] = $optionObj['option_id'];
            $option['name'] = 'options[' . $optionObj['option_id'] . '][]';
            $option['label'] = $optionObj['title'];
            $option['type'] = $optionObj['type'];
            $option['price'] = $optionObj['price'];
            $option['price_type'] = $optionObj['price_type'];
            $option['is_super'] = 0;

            $values = array();

            foreach ($_option->getValues() as $value) {

                $value = json_decode($value->toJson(), true);

                $values[] = array(
                    'label' => $value['title'],
                    'price' => $value['price'],
                    'price_type' => $value['price_type'],
                    'value' => $value['option_type_id']
                );
            }

            $option['values'] = $values;

            $responseOptions[] = $option;
        }

        return $responseOptions;
    }

    function getProductIdsByCategory($cat_id, $offset, $orderby, $order,
            $limit = 50) {

        $limit = ($limit == 0) ? 50 : $limit;

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

        if ($limit != -1) {
            $products->setPageSize($limit);
        }

        if (is_array($orderby)) {
            foreach ($orderby as $field) {
                $products->addAttributeToSort($field, $order);
            }
        }

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
