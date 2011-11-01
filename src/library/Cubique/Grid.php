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
     * @var array
     */
    private $_joins = array();

    /**
     * @var string
     */
    private $_logFile;

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
     * Sets JOIN statement for column.
     * @param  string $column
     * @param  string $joinTable
     * @param  string $conditionColumn
     * @param  string $conditionJoinColumn
     * @param  string $selectColumn
     * @return Cubique_Grid
     */
    public function setJoin($column, $joinTable, $conditionColumn, $conditionJoinColumn, $selectColumn)
    {
        $columns = array($column);
        $this->_checkColumnsExistAndStrings($columns);
        if (!is_string($joinTable)) {
            throw new Cubique_Exception('String expected for `$joinTable`');
        }
        if (!is_string($conditionColumn)) {
            throw new Cubique_Exception('String expected for `$conditionColumn`');
        }
        if (!is_string($conditionJoinColumn)) {
            throw new Cubique_Exception('String expected for `$conditionJoinColumn`');
        }
        if (!is_string($selectColumn)) {
            throw new Cubique_Exception('String expected for `$selectColumn`');
        }
        $this->_joins[$column] = array(
            'join_table'            => $joinTable,
            'condition_column'      => $conditionColumn,
            'condition_join_column' => $conditionJoinColumn,
            'select_column'         => $selectColumn
        );
        return $this;
    }

    /**
     * Logs all exceptions of getData() method to log file.
     * @param  string $pathToLogFile
     * @return Cubique_Grid
     */
    public function logErrors($pathToLogFile)
    {
        if (!file_exists($pathToLogFile)) {
            throw new Cubique_Exception('Log file is not exist.');
        }
        if (!is_writable($pathToLogFile)) {
            throw new Cubique_Exception('Log file is not writable');
        }
        $this->_logFile = $pathToLogFile;
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
            if (!count($this->_columns)) {
                throw new Cubique_Exception('`$this->_columns` can not be empty');
            }
            $columns = $this->_columns;
            if (count($this->_joins)) {
                foreach ($this->_joins as $column => $join) {
                    unset($columns[$column]);
                }
            }
            $columns     = array_keys($columns);
            $countSelect = $table->select()->from($this->_table, array($columns[0]));
            $select      = $table->select()
                    ->from($this->_table, $columns)
                    ->limitPage($table->getAdapter()->quote($currPage), $rowsOnPage);
            if (count($this->_joins)) {
                $countSelect->setIntegrityCheck(false);
                $select->setIntegrityCheck(false);
                foreach ($this->_joins as $column => $join) {
                    $joinTable     = $join['join_table'];
                    $joinSelect    = array($column => $join['select_column']);
                    $joinCondition = $join['join_table'] . '.' . $join['condition_join_column'] . '=' .
                        $this->_table . '.' . $join['condition_column'];
                    $select->joinLeft($joinTable, $joinCondition, $joinSelect);
                    $countSelect->joinLeft($joinTable, $joinCondition, $joinSelect);
                }
            }
            if ($sort) {
                $select->order($sort);
            } elseif ($this->_defaultOrder) {
                $select->order($this->_defaultOrder);
            }
            if ($search) {
                foreach ($search as $searchColumn => $searchValue) {
                    if (!$searchValue) {
                        continue;
                    }
                    if (array_key_exists($searchColumn, $this->_joins)) {
                        $searchColumn = '`' . $this->_joins[$searchColumn]['join_table'] . '`.`' .
                                        $this->_joins[$searchColumn]['select_column'] . '`';
                    } else {
                        $searchColumn = '`' . $this->_table . '`.`' . $searchColumn . '`';
                    }
                    $where = $table->getAdapter()->quoteInto($searchColumn . ' LIKE ?', '%' . $searchValue . '%');
                    $select->where($where);
                    $countSelect->where($where);
                }
            }
            $result  = $table->fetchAll($select)->toArray();
            $view    = new Zend_View();
            $data    = array();
            $columns = array_keys($this->_columns);
            foreach ($result as $key => &$row) {
                foreach ($columns as $column) {
                    if (in_array($column, $this->_columnsToEscape)) {
                        $row[$column] = $view->escape($row[$column]);
                    }
                    $data[$key][$column] = $row[$column];
                }
            }
            unset($row);
            return array(
                'data'  => $data,
                'count' => $table->fetchAll($countSelect)->count(),
                'error' => false
            );
        } catch (Exception $e) {
            if ($this->_logFile) {
                file_put_contents($this->_logFile, Zend_Date::now()->get(Zend_Date::DATETIME_MEDIUM) . ': ' . $e->getMessage() . "\n", FILE_APPEND);
            }
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