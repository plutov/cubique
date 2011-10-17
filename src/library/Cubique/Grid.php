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
     * Grid name
     * Should be unique for grids displayed on one page
     * @var string
     */
    private $_name;

    /**
     * Table name
     * @var string
     */
    private $_table;

    /**
     * Displayed columns
     * @var array
     */
    private $_columns;

    /**
     * Number of displayed rows on page
     * @var int
     */
    private $_rowsOnPage = 10;

    /**
     * Columns names for which sorting is available
     * @var array
     */
    private $_columnsToSort = array();

    /**
     * Columns names for escaping
     * @var array
     */
    private $_columnsToEscape = array();

    /**
     * Columns names for searching
     * @var array
     */
    private $_columnsToSearch = array();

    /**
     * Constructor
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
     * Set table name and primary column
     * @param  string $table
     * @param  string $primary
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
     * Set displayed columns
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
     * Set number of displayed rows on page
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
     * Set columns for which sorting is available
     * @param  array $columnsToSort
     * @return Cubique_Grid
     */
    public function setColumnsToSort($columnsToSort)
    {
        if (!is_array($columnsToSort)) {
            throw new Cubique_Exception('Array expected for `$columnsToSort`');
        }
        $columnsToSort         = array_values($columnsToSort);
        $columnsToSortWithKeys = array();
        foreach ($columnsToSort as $columnName) {
            if (!is_string($columnName)) {
                throw new Cubique_Exception('String expected for `$columnName`');
            }
            if (!array_key_exists($columnName, $this->_columns)) {
                throw new Cubique_Exception('Column not found');
            }
            $columnsToSortWithKeys[$columnName] = $columnName;
        }
        $this->_columnsToSort = $columnsToSortWithKeys;
        return $this;
    }

    /**
     * Set columns for escaping
     * @param  array $columnsToEscape
     * @return Cubique_Grid
     */
    public function setColumnsToEscape($columnsToEscape)
    {
        if (!is_array($columnsToEscape)) {
            throw new Cubique_Exception('Array expected for `$columnsToEscape`');
        }
        $columnsToEscape = array_values($columnsToEscape);
        foreach ($columnsToEscape as $columnName) {
            if (!is_string($columnName)) {
                throw new Cubique_Exception('String expected for `$columnName`');
            }
            if (!array_key_exists($columnName, $this->_columns)) {
                throw new Cubique_Exception('Column not found');
            }
        }
        $this->_columnsToEscape = $columnsToEscape;
        return $this;
    }

    /**
     * Set columns for searching
     * @param  array $columnsToSearch
     * @return Cubique_Grid
     */
    public function setColumnsToSearch($columnsToSearch)
    {
        if (!is_array($columnsToSearch)) {
            throw new Cubique_Exception('Array expected for `$columnsToSearch`');
        }
        $columnsToSearch         = array_values($columnsToSearch);
        $columnsToSearchWithKeys = array();
        foreach ($columnsToSearch as $columnName) {
            if (!is_string($columnName)) {
                throw new Cubique_Exception('String expected for `$columnName`');
            }
            if (!array_key_exists($columnName, $this->_columns)) {
                throw new Cubique_Exception('Column not found');
            }
            $columnsToSearchWithKeys[$columnName] = $columnName;
        }
        $this->_columnsToSearch = $columnsToSearchWithKeys;
        return $this;
    }

    /**
     * Return data
     * @param  array $post
     * @return array
     */
    public function getData($post)
    {
        $result = array(
            'error' => false,
            'data'  => array(),
            'count' => 0
        );
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
            }
            if ($search) {
                foreach ($search as $searchColumn => $searchValue) {
                    $where = $table->getAdapter()->quoteInto($searchColumn . ' LIKE ?', '%' . $searchValue . '%');
                    $select->where($where);
                    $countSelect->where($where);
                }
            }
            $data = $table->fetchAll($select)->toArray();
            if (count($this->_columnsToEscape)) {
                $view = new Zend_View();
                foreach ($data as &$row) {
                    foreach ($this->_columnsToEscape as $escapeColumn) {
                        $row[$escapeColumn] = $view->escape($row[$escapeColumn]);
                    }
                }
            }
            $result['data'] = $data;
            $result['count'] = $table->fetchAll($countSelect)->count();
        } catch (Exception $e) {
            $result['error'] = true;
        }
        return $result;
    }

    /**
     * Return HTML and Javascript for grid initialization
     * @return string
     */
    public function __toString()
    {
        $options = array(
            'name'            => $this->_name,
            'columns'         => $this->_columns,
            'rowsOnPage'      => $this->_rowsOnPage,
            'columnsToSort'   => $this->_columnsToSort,
            'columnsToSearch' => $this->_columnsToSearch
        );
        $optionsJson = Zend_Json_Encoder::encode($options);
        $html = '<div id="cubique-' . $this->_name . '"></div>' .
                '<script type="text/javascript">' .
                '$(document).ready(function(){' .
                'cubique_' . $this->_name . '=new Cubique(' . $optionsJson . ');' .
                '});</script>';
        return $html;
    }
}