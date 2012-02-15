<?php
/**
 * Cubique_Grid
 * @author    Alexander Plutov
 * @copyright (c) 2011-2012 Alexander Plutov
 * @link      https://github.com/plutov/cubique
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
     * @var string
     */
    private $_errorMessage = 'Error has been occurred. Try to refresh the page.';

    /**
     * @var array
     */
    private $_specialDataSeparators = array('<!', '!>');

    /**
     * @var array
     */
    private $_specialData = array();

    /**
     * @var array
     */
    private $_where = array();

    /**
     * Sets name of the grid. Name should be a unique string with only letters and numbers.
     * @throws Cubique_InvalidArgumentException
     * @param  string $name
     */
    public function __construct($name)
    {
        if (!is_string($name)) {
            $this->_typeException('string', '$name');
        }
        if (empty($name)) {
            throw new Cubique_InvalidArgumentException('"$name" can not be empty.');
        }
        $alNum = new Zend_Validate_Alnum();
        if (!$alNum->isValid($name)) {
            throw new Cubique_InvalidArgumentException('"$name" can contains only letters and numbers.');
        }
        $this->_name = $name;
    }

    /**
     * Sets table name for getting data.
     * @throws Cubique_InvalidArgumentException
     * @param  string $table
     * @return Cubique_Grid
     */
    public function setTable($table)
    {
        if (!is_string($table)) {
            $this->_typeException('string', '$table');
        }
        if (empty($table)) {
            throw new Cubique_InvalidArgumentException('"$table" can not be empty.');
        }
        $this->_table = $table;
        return $this;
    }

    /**
     * Sets displayed columns. Array format: columnName => columnLabel.
     * @throws Cubique_InvalidArgumentException
     * @param  array $columns
     * @return Cubique_Grid
     */
    public function setColumns($columns)
    {
        if (!is_array($columns)) {
            $this->_typeException('array', '$columns');
        }
        if (count($columns)) {
            $this->_checkColumns($columns, false);
            $this->_columns = $columns;
        } else {
            throw new Cubique_InvalidArgumentException('"$columns" can not be empty.');
        }
        return $this;
    }

    /**
     * Sets default order rule.
     * @throws Cubique_InvalidArgumentException
     * @param string $order
     * @return Cubique_Grid
     */
    public function setDefaultOrder($order)
    {
        if (!is_string($order)) {
            $this->_typeException('string', '$order');
        }
        if (empty($order)) {
            throw new Cubique_InvalidArgumentException('"$order" can not be empty.');
        }
        $this->_defaultOrder = $order;
        return $this;
    }

    /**
     * Sets default number of items per page.
     * @throws Cubique_InvalidArgumentException
     * @param  int $rowsOnPage
     * @return Cubique_Grid
     */
    public function setRowsOnPage($rowsOnPage)
    {
        if (!is_int($rowsOnPage)) {
            $this->_typeException('int', '$rowsOnPage');
        }
        if ($rowsOnPage <= 0) {
            throw new Cubique_InvalidArgumentException('Invalid value for "$rowsOnPage".');
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
        $this->_checkColumns($columns);
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
        $this->_checkColumns($columns);
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
        $this->_checkColumns($columns);
        $values = array_values($columns);
        $this->_columnsToSearch = array_combine($values, $values);
        return $this;
    }

    /**
     * Checks if columns have string type. Throws an exception for error. Also can check if columns exist.
     * @throws Cubique_Exception
     * @param  mixed $columns
     * @param  bool $mustExist
     * @return void
     */
    private function _checkColumns($columns, $mustExist = true)
    {
        if (!is_array($columns)) {
            $this->_typeException('array', '$columns');
        }
        foreach ($columns as $column) {
            if (!is_string($column)) {
                $this->_typeException('string', '$column');
            }
            if ($mustExist && !array_key_exists($column, $this->_columns)) {
                throw new Cubique_Exception('Column "' . $column . '" not found.');
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
            $this->_typeException('string', '$url');
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
        $this->_checkColumns($columns);
        if (!is_string($joinTable)) {
            $this->_typeException('string', '$joinTable');
        }
        if (!is_string($conditionColumn)) {
            $this->_typeException('string', '$conditionColumn');
        }
        if (!is_string($conditionJoinColumn)) {
            $this->_typeException('string', '$conditionJoinColumn');
        }
        if (!is_string($selectColumn)) {
            $this->_typeException('string', '$selectColumn');
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
     * Logs all exceptions of _getData() method to log file.
     * @throws Cubique_Exception
     * @param  string $pathToLogFile
     * @return Cubique_Grid
     */
    public function logErrors($pathToLogFile)
    {
        if (!is_string($pathToLogFile)) {
            $this->_typeException('string', '$pathToLogFile');
        }
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
     * Sets message for displaying error.
     * @param  string $message
     * @return Cubique_Grid
     */
    public function setErrorMessage($message)
    {
        if (!is_string($message)) {
            $this->_typeException('string', '$message');
        }
        $this->_errorMessage = $message;
        return $this;
    }

    /**
     * Sets special data for column, uses custom variables. <!column_name!> will be replaced by value of column.
     * @param  string $column
     * @param  string $newData
     * @return Cubique_Grid
     */
    public function setSpecialData($column, $newData)
    {
        $columns = array($column);
        $this->_checkColumns($columns);
        if (!is_string($newData)) {
            $this->_typeException('string', '$newData');
        }
        $this->_specialData[$column] = $newData;
        return $this;
    }

    /**
     * Sets separators for method setSpecialData().
     * @throws Cubique_Exception
     * @param  string $open
     * @param  string $close
     * @return Cubique_Grid
     */
    public function setSpecialDataSeparators($open, $close)
    {
        if (!is_string($open)) {
            $this->_typeException('string', '$open');
        }
        if (!is_string($close)) {
            $this->_typeException('string', '$close');
        }
        if ($open == $close) {
            throw new Cubique_Exception('Open separator shouldn\'t be equal with close separator');
        }
        $this->_specialDataSeparators = array($open, $close);
        return $this;
    }

    /**
     * Adds permanent where statement. Please add table prefix to columns names for avoiding ambiguous errors.
     * If not the first method adds "AND" before statement.
     * @param  string $where
     * @return Cubique_Grid
     */
    public function addWhere($where)
    {
        $this->_addWhere($where, true);
        return $this;
    }

    /**
     * Adds permanent where statement. Please add table prefix to columns names for avoiding ambiguous errors.
     * If not the first method adds "OR" before statement.
     * @param  string $where
     * @return Cubique_Grid
     */
    public function addOrWhere($where)
    {
        $this->_addWhere($where, false);
        return $this;
    }

    /**
     * Abstract method for adding WHERE statement.
     * @param  string $where
     * @param  bool $and
     * @return void
     */
    private function _addWhere($where, $and)
    {
        if (!is_string($where)) {
            $this->_typeException('string', '$where');
        }
        $this->_where[] = array(
            'string' => $where,
            'and'    => $and
        );
    }

    /**
     * Returns data from the table using current grid settings.
     * Result format: 'error' => bool, 'data' => array, 'count' => int.
     * @throws Cubique_Exception
     * @param  array $post
     * @return array
     */
    private function _getData($post)
    {
        try {
            if (!isset($post['cubique'])) {
                throw new Cubique_Exception('Invalid post data');
            }
            $cubique    = $post['cubique'];
            $currPage   = isset($cubique['curr_page']) ? intval($cubique['curr_page']) : 1;
            $sort       = isset($cubique['sort']) ? $cubique['sort'] : '';
            $search     = isset($cubique['search']) ? $cubique['search'] : array();
            $rowsOnPage = isset($cubique['rows_on_page']) ? intval($cubique['rows_on_page']) : $this->_rowsOnPage;
            if (!$this->_table) {
                throw new Cubique_Exception('"$this->_table" can not be empty.');
            }
            $table   = new Zend_Db_Table($this->_table);
            $adapter = $table->getAdapter();
            if (!count($this->_columns)) {
                throw new Cubique_Exception('"$this->_columns" can not be empty.');
            }
            $columns = $this->_columns;
            foreach ($this->_joins as $column => $join) {
                unset($columns[$column]);
            }
            $columns     = array_keys($columns);
            $countSelect = $table->select()
                    ->from($this->_table, array($columns[0]))
                    ->setIntegrityCheck(false);
            $select      = $table->select()
                    ->from($this->_table, $columns)
                    ->setIntegrityCheck(false)
                    ->limitPage($adapter->quote($currPage), $rowsOnPage);
            foreach ($this->_where as $where) {
                if ($where['and']) {
                    $select->where($where['string']);
                    $countSelect->where($where['string']);
                } else {
                    $select->orWhere($where['string']);
                    $countSelect->orWhere($where['string']);
                }
            }
            foreach ($this->_joins as $column => $join) {
                $joinTable     = $join['join_table'];
                $joinSelect    = array($column => $join['select_column']);
                $joinCondition = $join['join_table'] . '.' . $join['condition_join_column'] . '=' .
                    $this->_table . '.' . $join['condition_column'];
                $select->joinLeft($joinTable, $joinCondition, $joinSelect);
                $countSelect->joinLeft($joinTable, $joinCondition, $joinSelect);
            }
            if ($sort) {
                $select->order($sort);
            } elseif ($this->_defaultOrder) {
                $select->order($this->_defaultOrder);
            }
            if ($search) {
                foreach ($search as $searchColumn => $searchArray) {
                    if (!isset($searchArray[0]) || !isset($searchArray[1])) {
                        continue;
                    }
                    $searchValue = $searchArray[0];
                    $searchType  = $searchArray[1];
                    // Invalid search condition or empty.
                    if (!$searchValue || !$searchType || !in_array($searchType, array('LIKE', '=', '<>', '<', '>', '<=', '>='))) {
                        continue;
                    }
                    $searchWrapper = ''; // Percents for LIKE.
                    if ($searchType == 'LIKE') {
                        $searchWrapper = '%';
                    }
                    if (array_key_exists($searchColumn, $this->_joins)) {
                        $searchColumn = $this->_joins[$searchColumn]['join_table'] . '.' .
                                        $this->_joins[$searchColumn]['select_column'];
                    } else {
                        $searchColumn = $this->_table . '.' . $searchColumn;
                    }
                    $where = $adapter->quoteInto($adapter->quoteIdentifier($searchColumn) . ' ' . $searchType . ' ?', $searchWrapper . $searchValue . $searchWrapper);
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
                    if (array_key_exists($column, $this->_specialData)) {
                        $newValue = $this->_specialData[$column];
                        foreach ($columns as $specialColumn) {
                            $customVar = $this->_specialDataSeparators[0] . $specialColumn . $this->_specialDataSeparators[1];
                            $newValue = str_replace($customVar, $row[$specialColumn], $newValue);
                        }
                        $row[$column] = $newValue;
                    }
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
                file_put_contents($this->_logFile, str_pad(Zend_Date::now()->get(Zend_Date::DATETIME_MEDIUM) . ':', 20)
                    . ' ' . $e->getMessage() . "\n", FILE_APPEND);
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
        $optionsJson = Zend_Json_Encoder::encode(array(
            'name'            => $this->_name,
            'columns'         => $this->_columns,
            'rowsOnPage'      => $this->_rowsOnPage,
            'columnsToSort'   => $this->_columnsToSort,
            'columnsToSearch' => $this->_columnsToSearch,
            'url'             => $this->_url,
            'error_message'   => $this->_errorMessage
        ));
        return '<div id="cubique-' . $this->_name . '"></div>' . PHP_EOL .
               '<script type="text/javascript">' . PHP_EOL .
                   '$(document).ready(function() {' . PHP_EOL .
                       'cubique_' . $this->_name . ' = new Cubique(' . $optionsJson . ');' . PHP_EOL .
                   '});' . PHP_EOL .
               '</script>' . PHP_EOL;
    }

    /**
     * Call _getData() method with POST data.
     * @return void
     */
    public function dispatch()
    {
        $request = Zend_Controller_Front::getInstance()->getRequest();
        if ($request->isXmlHttpRequest()) {
            Zend_Controller_Action_HelperBroker::getStaticHelper('json')
                ->sendJson($this->_getData($request->getPost()));
        }
    }

    /**
     * Throw type exception.
     * @throws Cubique_InvalidArgumentException
     * @param  string $type
     * @param  string $variable
     * @return void
     */
    private function _typeException($type, $variable)
    {
        throw new Cubique_InvalidArgumentException(ucfirst($type) . ' expected for "' . $variable . '".');
    }
}