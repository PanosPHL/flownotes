import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../store/ui/nav';
import Sidebar from 'react-sidebar';
import styles from '../css-modules/SideNavComponent.module.css';
import SideBarContext from '../contexts/SideBarContext';
import SideNavContent from './SideNavContent';

const SideNavComponent = (props) => {
    const dispatch = useDispatch();
    const { open } = useSelector(state => state.ui.nav);
    const [className, setClassName] = useState('Closed');

    useEffect(() => {
        open ? setClassName('Open') : setClassName('Closed');
    }, [open])

    const openSidebar = () => {
        dispatch(toggleSidebar());
    }

    const value = {
        className,
        handlers: {
            openSidebar
        }
    };

    return (
        <SideBarContext.Provider value={value}>
        <Sidebar
        sidebar={
        <SideNavContent />
        }
        sidebarClassName={styles['sidebar' + className]}
        docked={true}
            open={open}
            onSetOpen={openSidebar}
            styles={{ root: { width: '8vw', minHeight: props.pageName === 'fetchFlow' ? '1080px' : props.pageName === 'browseFlows' ? '1220px' : '100%'}, sidebar: { background: 'black', transition: "", WebkitTransition: "" }, content: { zIndex: 2 }}}
        >
            <div />
        </Sidebar>
        </SideBarContext.Provider>
    )
}

export default SideNavComponent;