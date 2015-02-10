<?php

/**
 * Description of ProductThumbs
 *
 * @author Makki
 */
class Maxxsol_ExtendAPI_Model_Catalog_Product_ProductNextThumb extends Mage_Api2_Model_Resource {

    function getProductNextThumbByCategory($cat_id, $product_id, $limit = 1) {

        $limit = ($limit == 0) ? 1 : $limit;

        $category = Mage::getModel('catalog/category')->load($cat_id);
        $cs_categories = $category->getAllChildren();

        $_resource = Mage::getSingleton('core/resource');
        $_category_table = $_resource->getTableName('catalog_category_product');
        $_product_table = $_resource->getTableName('catalog_product_entity');
        $_attribute_value_table = $_resource->getTableName('catalog_product_entity_int');
        $_attribute_table = $_resource->getTableName('eav_attribute');

        $_conn = $_resource->getConnection('core_read');

        //getting row number of product_id
        $sql = sprintf('SELECT @curRow := @curRow + 1 AS row_num, temp.* '
                . 'FROM (SELECT DISTINCT p.entity_id AS product_id '
                . ' FROM %s AS cp '
                . ' JOIN %s AS p ON p.entity_id = cp.product_id '
                . ' JOIN %s AS atv1 ON atv1.entity_id = p.entity_id '
                . ' JOIN %s AS att1 ON att1.attribute_id = atv1.attribute_id '
                . ' JOIN %s AS atv2 ON atv2.entity_id = p.entity_id '
                . ' JOIN %s AS att2 ON att2.attribute_id = atv2.attribute_id '
                . ' WHERE cp.`category_id` IN (%s)'
                . ' AND atv1.value=' . Mage_Catalog_Model_Product_Visibility::VISIBILITY_BOTH
                . ' AND atv2.value=' . Mage_Catalog_Model_Product_Status::STATUS_ENABLED
                . ' AND att1.attribute_code="visibility"'
                . ' AND att2.attribute_code="status"'
                . ' ORDER BY p.created_at DESC) AS temp '
                . ' JOIN (SELECT @curRow := 0) row', $_category_table, $_product_table, $_attribute_value_table, $_attribute_table, $_attribute_value_table, $_attribute_table, $cs_categories, $product_id);

        $row_num = null;

        foreach ($_conn->fetchAll($sql) as $arr_row) {
            if ($arr_row['product_id'] == $product_id) {
                $row_num = $arr_row['row_num'];
                break;
            }
        }
        $productThumbs = array();

        if ($row_num) {
            $sql = sprintf('SELECT * FROM '
                    . '(SELECT @curRow := @curRow + 1 AS row_num, temp.* '
                    . 'FROM (SELECT DISTINCT p.entity_id AS product_id '
                    . ' FROM %s AS cp '
                    . ' JOIN %s AS p ON p.entity_id = cp.product_id '
                    . ' JOIN %s AS atv1 ON atv1.entity_id = p.entity_id '
                    . ' JOIN %s AS att1 ON att1.attribute_id = atv1.attribute_id '
                    . ' JOIN %s AS atv2 ON atv2.entity_id = p.entity_id '
                    . ' JOIN %s AS att2 ON att2.attribute_id = atv2.attribute_id '
                    . ' WHERE cp.`category_id` IN (%s)'
                    . ' AND atv1.value=' . Mage_Catalog_Model_Product_Visibility::VISIBILITY_BOTH
                    . ' AND atv2.value=' . Mage_Catalog_Model_Product_Status::STATUS_ENABLED
                    . ' AND att1.attribute_code="visibility"'
                    . ' AND att2.attribute_code="status"'
                    . ' ORDER BY p.created_at DESC) AS temp '
                    . ' JOIN (SELECT @curRow := 0) row ) AS t '
                    . ' WHERE t.row_num > %d LIMIT %d', $_category_table, $_product_table, $_attribute_value_table, $_attribute_table, $_attribute_value_table, $_attribute_table, $cs_categories, $row_num, $limit);

            foreach ($_conn->fetchAll($sql) as $arr_row) {
                $product = Mage::getModel('catalog/product')->load($arr_row['product_id']);
                $thumbUrl = $product->getThumbnailUrl(200, 60);
                $productThumbs[] = array(
                    'entity_id' => $product->getId(),
                    'thumb_url' => $thumbUrl
                );
            }
        }

        return $productThumbs;
    }

}
