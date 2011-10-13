<?php
/**
 * Cubique_Grid
 * @author    Alexander Plutov
 * @copyright (c) 2011 Alexander Plutov
 * @license   https://github.com/plutov/cubique/blob/master/LICENSE
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
        if (!count($columns)) {
            throw new Cubique_Exception('`$columns` can not be empty');
        }
        foreach ($columns as $columnName => $columnLabel) {
            if (!is_string($columnName)) {
                throw new Cubique_Exception('String expected for `$columnName`');
            }
            if (!is_string($columnLabel)) {
                throw new Cubique_Exception('String expected for `$columnLabel`');
            }
        }
        $this->_columns = $columns;
        return $this;
    }

    /**
     * Return HTML and Javascript for grid initialization
     * @return string
     */
    public function __toString()
    {
        if (is_null($this->_columns)) {
            throw new Cubique_Exception('`$columns` can not be empty');
        }
        $options = array(
            'name'    => $this->_name,
            'columns' => $this->_columns
        );
        $optionsJson = Zend_Json_Encoder::encode($options);
        $html = '<div id="cubique-' . $this->_name . '"></div>' .
                '<script type="text/javascript">' .
                '$(document).ready(function(){' .
                'cubique_' . $this->_name . '=new Cubique(' . $optionsJson . ');' .
                '});</script>';
        return $html;
    }

    /**
     * Return data
     * @return array
     */
    public function getData()
    {
        $result = array(
            'error' => false,
            'data'  => array()
        );
        try {
            $table = new Zend_Db_Table($this->_table);
            $select = $table->select()
                    ->from($this->_table, array_keys($this->_columns));
            $result['data'] = $table->fetchAll($select)->toArray();
        } catch (Exception $e) {
            $result['error'] = true;
        }
        return $result;
    }
}