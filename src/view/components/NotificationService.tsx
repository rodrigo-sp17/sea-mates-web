import { userState } from "api/model/user_model";
import React, { useState, useEffect, SyntheticEvent } from "react";
import { useRecoilValue } from "recoil";
import { EventSourcePolyfill } from 'event-source-polyfill';
import { IconButton, Badge, Menu, MenuItem } from "@material-ui/core";
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationEvent from "api/data/notification_event";
import { useHistory } from "react-router-dom";

export default function NotificationService() {
  const history = useHistory();
  const [notifs, setNotifs] = useState<Array<NotificationEvent>>([]);
  const [newNotifs, setNewNotifs] = useState(0);
  const [anchor, setAnchor] = useState<Element | null>(null);
  const user = useRecoilValue(userState)


  const subscribePush = () => {
    var es = new EventSourcePolyfill(
      '/api/push/subscribe/' + user.username,
      {
        headers: {
          "Authorization": user.bearerToken,
        }
      }
    );

    es.onerror = () => es.close();
    es.addEventListener("FRIEND_REQUEST", (e: any) => handleFriendRequestEvent(e));
    es.addEventListener("FRIEND_ACCEPT", (e: any) => handleFriendAcceptEvent(e));
  }

  useEffect(() => {
    subscribePush();
  }, []);

  const handleFriendRequestEvent = function (event: any) {
    const username = user.username;
    const data = JSON.parse(event.data);
    const source = data.source;
    if (source !== username) {
      var note = `${source} solicitou sua amizade!`;
      addNotifs(new NotificationEvent(note, 'FRIEND'));
    }
  }

  const handleFriendAcceptEvent = function (event: any) {
    const username = sessionStorage.getItem("loggedUsername");
    const data = JSON.parse(event.data);
    const source = data.source;
    if (source !== username) {
      var note = `${source} aceitou sua solicitação!`;
      addNotifs(new NotificationEvent(note, 'FRIEND'));
    }
  }

  const addNotifs = (notif: NotificationEvent) => {
    var updatedNotifs = notifs.concat(notif);
    setNotifs(updatedNotifs)
    setNewNotifs(newNotifs + 1);
  }

  const redirectCallback = (notifType: string) => {
    switch (notifType) {
      case 'FRIEND':
        return () => history.push('/home/friends');
      default:
        return () => { };
    }
  }

  const handleMenuOpen = (event: SyntheticEvent) => {
    setNewNotifs(0);
    setAnchor(event.currentTarget);
  }

  const handleMenuClose = () => {
    setAnchor(null);
  }

  return (
    <div>
      <IconButton onClick={handleMenuOpen} color="inherit">
        <Badge
          badgeContent={newNotifs}
          color="error"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        id="menu-notifications"
        anchorEl={anchor}
        keepMounted
        open={Boolean(anchor)}
        onClose={handleMenuClose}
      >
        {notifs.length === 0 ? <MenuItem>Nenhuma notif.</MenuItem>
          : notifs.map((notif: NotificationEvent, index: number) => <NotificationTab key={index} content={notif.content} callback={redirectCallback(notif.type)} />)}
      </Menu>
    </div>
  );
}

function NotificationTab({ key, content, callback }: any) {
  return (
    <MenuItem key={key} button onClick={callback}>{content}</MenuItem>
  );
}