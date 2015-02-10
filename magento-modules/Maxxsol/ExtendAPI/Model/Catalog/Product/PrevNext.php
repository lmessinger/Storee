<?php

/**
 * Description of Maxxsol_ExtendAPI_Model_Catalog_Product_PrevNext
 *
 * @author Makki
 */
class Maxxsol_ExtendAPI_Model_Catalog_Product_PrevNext extends Mage_Api2_Model_Resource {

    function getPrevNextOfProduct($cat_id, $prod_id, $rank, $orderby,
            $order = 'DESC', $prevNext = 'prevnext', $limit = 1) {

        $limit = ($limit == 0) ? 1 : $limit;

        //Thumnail Dimension
        $thumbDim = array(
            'width' => 200,
            'height' => 60
        );

        $_product = Mage::getModel('catalog/product')->load($prod_id);
        $category = Mage::getModel('catalog/category')->load($cat_id);

        $_resource = Mage::getSingleton('core/resource');
        $_conn = $_resource->getConnection('core_read');

        $collection = Mage::getResourceModel('catalog/product_collection')
                ->setStoreId(1)
                ->setPageSize($limit)
                ->addAttributeToFilter(
                        'status',
                        array('eq' => Mage_Catalog_Model_Product_Status::STATUS_ENABLED)
                )
                ->addAttributeToFilter('visibility',
                        Mage_Catalog_Model_Product_Visibility::VISIBILITY_BOTH)
                ->addCategoryFilter($category);

        if (is_array($orderby)) {
            foreach ($orderby as $field) {
                $collection->addAttributeToSort($field, $order);
            }
        }

        $main_query = $collection->getSelect();
        $productIds = array();

        if (!$rank) {
            //getting rank of product_id
            $sql = sprintf('SELECT @curRow := @curRow + 1 AS row_num, temp.* '
                    . 'FROM (%s) AS temp '
                    . ' JOIN (SELECT @curRow := 0) row', $main_query);
            foreach ($_conn->fetchAll($sql) as $arr_row) {
                if ($arr_row['entity_id'] == $prod_id) {
                    $rank = intval($arr_row['row_num']);
                    break;
                }
            }
        }

        if ($rank) {
            if ($prevNext == 'prevnext' || $prevNext == 'prev') {
                //getting previous items
                $sql = sprintf('SELECT * FROM '
                        . '(SELECT @curRow := @curRow + 1 AS row_num, temp.* '
                        . 'FROM (%s) AS temp '
                        . ' JOIN (SELECT @curRow := 0) row ) AS t '
                        . ' WHERE t.row_num < %d AND t.row_num > %d LIMIT %d',
                        $main_query, $rank, $rank - $limit, $limit);

                //loading previous products in the response
                foreach ($_conn->fetchAll($sql) as $arr_row) {
                    $product = Mage::getModel('catalog/product')->load($arr_row['entity_id']);
                    $slug = $product->getUrlKey();
                    if (empty($slug)) {
                        $slug = $product->formatUrlKey($product->getName());
                    }
                    $productIds[$arr_row['entity_id']] = array(
                        'entity_id' => $product->getId(),
                        'rank' => intval($arr_row['row_num']),
                        'name' => $product->getName(),
                        'title' => $product->getShortDescription(),
                        'desc' => $product->getDescription(),
                        'regular_price' => $product->getPrice(),
                        'final_price' => $product->getFinalPrice(),
                        'slug' => $slug,
                        'thumb_url' => $product->getThumbnailUrl($thumbDim['width'],
                                $thumbDim['height']),
                        'image_url' => Mage::getModel('catalog/product_media_config')->getMediaUrl($product->getImage()),
                        'product_url' => $product->getProductUrl()
                    );
                }
            }

            //loading current product in the response
            $slug = $_product->getUrlKey();
            if (empty($slug)) {
                $slug = $_product->formatUrlKey($_product->getName());
            }
            $productIds[$_product->getId()] = array(
                'entity_id' => $_product->getId(),
                'rank' => $rank,
                'name' => $_product->getName(),
                'title' => $_product->getShortDescription(),
                'desc' => $_product->getDescription(),
                'regular_price' => $_product->getPrice(),
                'final_price' => $_product->getFinalPrice(),
                'slug' => $slug,
                'thumb_url' => $_product->getThumbnailUrl($thumbDim['width'],
                        $thumbDim['height']),
                'image_url' => Mage::getModel('catalog/product_media_config')->getMediaUrl($_product->getImage()),
                'product_url' => $_product->getProductUrl()
            );

            if ($prevNext == 'prevnext' || $prevNext == 'next') {
                //getting next items
                $sql = sprintf('SELECT * FROM '
                        . '(SELECT @curRow := @curRow + 1 AS row_num, temp.* '
                        . 'FROM (%s) AS temp '
                        . ' JOIN (SELECT @curRow := 0) row ) AS t '
                        . ' WHERE t.row_num > %d AND t.row_num < %d LIMIT %d',
                        $main_query, $rank, $rank + $limit, $limit);

                //loading next products in the response
                foreach ($_conn->fetchAll($sql) as $arr_row) {
                    $product = Mage::getModel('catalog/product')->load($arr_row['entity_id']);
                    $slug = $product->getUrlKey();
                    if (empty($slug)) {
                        $slug = $product->formatUrlKey($product->getName());
                    }
                    $productIds[$arr_row['entity_id']] = array(
                        'entity_id' => $product->getId(),
                        'rank' => intval($arr_row['row_num']),
                        'name' => $product->getName(),
                        'title' => $product->getShortDescription(),
                        'desc' => $product->getDescription(),
                        'regular_price' => $product->getPrice(),
                        'final_price' => $product->getFinalPrice(),
                        'slug' => $slug,
                        'thumb_url' => $product->getThumbnailUrl($thumbDim['width'],
                                $thumbDim['height']),
                        'image_url' => Mage::getModel('catalog/product_media_config')->getMediaUrl($product->getImage()),
                        'product_url' => $product->getProductUrl()
                    );
                }
            }

            //converting associative array to indexed array
            $productIds = array_values($productIds);

            //returning empty array if we don't have previous and next products w.r.t current (discarding the current product from list)
            if (count($productIds) == 1) {
                return array();
            }
        }
        return $productIds;
    }

}
