<?php
/**
 * Cubique_Grid
 * @author    Alexander Plutov
 * @copyright (c) 2011 Alexander Plutov
 * @license   https://github.com/plutov/cubique/wiki/License
 */
class Cubique_Grid
{
    /**
     * @var string
     */
    private $_name;

    /**
     * @var string
     */
    private $_table;

    /**
     * @var array
     */
    private $_columns;

    /**
     * @var string
     */
    private $_defaultOrder;

    /**
     * @var int
     */
    private $_rowsOnPage = 10;

    /**
     * @var array
     */
    private $_columnsToSort = array();

    /**
     * @var array
     */
    private $_columnsToEscape = array();

    /**
     * @var array
     */
    private $_columnsToSearch = array();

    /**
     * @var string
     */
    private $_url;

    /**
     * Sets name of the grid. Name should be a unique string with only letters and numbers.
     * @param string $name
     */
    public function __construct($name)
    {
        if (!is_string($name)) {
            throw new Cubique_Exception('String expected for `$name`');
        }
        if (!$name) {
            throw new Cubique_Exception('`$name` can not be empty');
        }
        $alnum = new Zend_Validate_Alnum();
        if (!$alnum->isValid($name)) {
            throw new Cubique_Exception('`$name` can contains only letters and numbers');
        }
        $this->_name = $name;
    }

    /**
     * Sets table name for getting data.
     * @param  string $table
     * @return Cubique_Grid
     */
    public function setTable($table)
    {
        if (!is_string($table)) {
            throw new Cubique_Exception('String expected for `$table`');
        }
        $this->_table   = $table;
        return $this;
    }

    /**
     * Sets displayed columns. Array format: columnName => columnLabel.
     * @param  array $columns
     * @return Cubique_Grid
     */
    public function setColumns($columns)
    {
        if (!is_array($columns)) {
            throw new Cubique_Exception('Array expected for `$columns`');
        }
        if (count($columns)) {
            foreach ($columns as $columnName => $columnLabel) {
                if (!is_string($columnName)) {
                    throw new Cubique_Exception('String expected for `$columnName`');
                }
                if (!is_string($columnLabel)) {
                    throw new Cubique_Exception('String expected for `$columnLabel`');
                }
            }
            $this->_columns = $columns;
        }
        return $this;
    }

    /**
     * Sets default order rule.
     * @param string $order
     * @return Cubique_Grid
     */
    public function setDefaultOrder($order)
    {
        if (!is_string($order)) {
            throw new Cubique_Exception('String expected for `$order`');
        }
        $this->_defaultOrder = $order;
        return $this;
    }

    /**
     * Sets default number of items per page.
     * @param  int $rowsOnPage
     * @return void
     */
    public function setRowsOnPage($rowsOnPage)
    {
        if (!is_int($rowsOnPage)) {
            throw new Cubique_Exception('Int expected for `$rowsOnPage`');
        }
        if ($rowsOnPage <= 0) {
            throw new Cubique_Exception('Invalid value for `$rowsOnPage`');
        }
        $this->_rowsOnPage = $rowsOnPage;
        return $this;
    }

    /**
     * Sets columns, for which sorting will be available.
     * Column should be added using setColumns before calling this method.
     * @param  array $columns
     * @return Cubique_Grid
     */
    public function setColumnsToSort($columns)
    {
        $this->_checkColumnsExistAndStrings($columns);
        $values = array_values($columns);
        $this->_columnsToSort = array_combine($values, $values);
        return $this;
    }

    /**
     * Sets columns, for which values will be escaped.
     * Columns should be added using setColumns before calling this method.
     * @param  array $columns
     * @return Cubique_Grid
     */
    public function setColumnsToEscape($columns)
    {
        $this->_checkColumnsExistAndStrings($columns);
        $values = array_values($columns);
        $this->_columnsToEscape = array_combine($values, $values);
        return $this;
    }

    /**
     * Sets columns, for which searching will be available.
     * Columns should be added using setColumns before calling this method.
     * @param  array $columns
     * @return Cubique_Grid
     */
    public function setColumnsToSearch($columns)
    {
        $this->_checkColumnsExistAndStrings($columns);
        $values = array_values($columns);
        $this->_columnsToSearch = array_combine($values, $values);
        return $this;
    }

    /**
     * Checks if columns exist and have string type. Throws an exception for error.
     * @param  mixed $columns
     * @return void
     */
    private function _checkColumnsExistAndStrings($columns)
    {
        if (!is_array($columns)) {
            throw new Cubique_Exception('Array expected for `$columns`');
        }
        foreach ($columns as $column) {
            if (!is_string($column)) {
                throw new Cubique_Exception('String expected for `$column`');
            }
            if (!array_key_exists($column, $this->_columns)) {
                throw new Cubique_Exception('Column not found');
            }
        }
    }

    /**
     * Sets URL for AJAX requests.
     * @param string $url
     * @return Cubique_Grid
     */
    public function setUrl($url)
    {
        if (!is_string($url)) {
            throw new Cubique_Exception('String expected for `$url`');
        }
        $this->_url = $url;
        return $this;
    }

    /**
     * Returns data from the table using current grid settings.
     * Result format: 'error' => bool, 'data' => array, 'count' => 0
     * @param  array $post
     * @return array
     */
    public function getData($post)
    {
        try {
            $currPage    = intval($post['cubique_grid_curr_page']);
            $sort        = $post['cubique_grid_sort'];
            $search      = $post['cubique_grid_search'];
            $rowsOnPage  = intval($post['cubique_grid_rows_on_page']);
            $table       = new Zend_Db_Table($this->_table);
            $countSelect = $table->select();
            $select      = $table->select()
                    ->from($this->_table, array_keys($this->_columns))
                    ->limitPage($table->getAdapter()->quote($currPage), $rowsOnPage);
            if ($sort) {
                $select->order($sort);
            } elseif ($this->_defaultOrder) {
                $select->order($this->_defaultOrder);
            }
            if ($search) {
                foreach ($search as $searchColumn => $searchValue) {
                    $where = $table->getAdapter()->quoteInto($searchColumn . ' LIKE ?', '%' . $searchValue . '%');
                    $select->where($where);
                    $countSelect->where($where);
                }
            }
            $data = $table->fetchAll($select)->toArray();
            if ($this->_columnsToEscape) {
                $view = new Zend_View();
                foreach ($data as &$row) {
                    foreach ($this->_columnsToEscape as $escapeColumn) {
                        $row[$escapeColumn] = $view->escape($row[$escapeColumn]);
                    }
                }
                unset($row);
            }
            return array(
                'data'  => $data,
                'count' => $table->fetchAll($countSelect)->count(),
                'error' => false
            );
        } catch (Exception $e) {
            return array('error' => true);
        }
    }

    /**
     * Return HTML and Javascript for grid initialization.
     * @return string
     */
    public function __toString()
    {
        $options = Zend_Json_Encoder::encode(array(
            'name'            => $this->_name,
            'columns'         => $this->_columns,
            'rowsOnPage'      => $this->_rowsOnPage,
            'columnsToSort'   => $this->_columnsToSort,
            'columnsToSearch' => $this->_columnsToSearch,
            'url'             => $this->_url
        ));
        return '<div id="cubique-' . $this->_name . '"></div><script type="text/javascript">$(document).ready(
               function(){cubique_' . $this->_name . '=new Cubique(' . $options . ');});</script>';
    }
}