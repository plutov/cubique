<?php
namespace Application\Controller;

use Zend\Mvc\Controller\ActionController;
use Cubique\Grid\Adapter as Cubique_Grid;

class IndexController extends ActionController
{
    public function indexAction()
    {
        $grid = new Cubique_Grid('province');
        $grid->setTable('province')
             ->setColumns(array(
                 'name'    => 'Name',
                 'code'    => 'Code',
                 'country' => 'Country',
                 'rating'  => 'Rating'
             ))
             //->setSpecialDataSeparators('<<!!', '!!>>')
             //->setSpecialData('name', '<b><<!!name!!>></b>')
             ->setDefaultOrder('name')
             ->setColumnsToSort(array('name', 'code', 'country', 'rating'))
             //->setColumnsToEscape(array('code'))
             ->setColumnsToSearch(array('name', 'code', 'country', 'rating'))
             //->setRowsOnPage(15)
             //->logErrors(APPLICATION_PATH . '/logs/cubique')
             //->setUrl('/')
             //->setErrorMessage('Error!')
             //->addWhere('country.name LIKE "A%"')
             //->addOrWhere('province.code LIKE "A%"')
             ->setJoin('country', 'country', 'country_id', 'id', 'name');
        $grid->dispatch();
        return array(
            'grid' => $grid
        );
    }
}