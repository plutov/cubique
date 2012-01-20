<?php
class IndexController extends Zend_Controller_Action
{
    public function indexAction()
    {
        $grid = new Cubique_Grid('province');
        $grid->setTable('province')
            ->setColumns(array(
                'name'        => 'Name',
                'code'        => 'Code',
                'country'     => 'Country'
            ))
            ->setSpecialData('name', '<b><!name!></b>')
            ->setDefaultOrder('name')
            ->setColumnsToSort(array('name', 'code', 'country'))
            ->setColumnsToEscape(array('code'))
            ->setColumnsToSearch(array('name', 'code', 'country'))
            ->setJoin('country', 'country', 'country_id', 'id', 'name');
        $grid->dispatch();
        $this->view->grid = $grid;
    }
}