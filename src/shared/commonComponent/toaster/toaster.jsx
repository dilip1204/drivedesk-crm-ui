import { Store } from 'react-notifications-component'

export const successNotification = {
    title: "",
    message: "",
    type: "success",
    insert: "top",
    container: "top-full",
    animationIn: ["animate__animated", "animate__fadeIn"],
    animationOut: ["animate__animated", "animate__fadeOut"],
    dismiss: {
      duration: 15000,
      onScreen: true
    }
}

export const warningNotification = {
    title: "",
    message: "",
    type: "warning",
    insert: "top",
    container: "top-full",
    animationIn: ["animate__animated", "animate__fadeIn"],
    animationOut: ["animate__animated", "animate__fadeOut"],
    dismiss: {
      duration: 15000,
      onScreen: true
    }
}

export const infoNotification = {
    title: "",
    message: "",
    type: "info",
    insert: "top",
    container: "top-full",
    animationIn: ["animate__animated", "animate__fadeIn"],
    animationOut: ["animate__animated", "animate__fadeOut"],
    dismiss: {
      duration: 15000,
      onScreen: true
    }
}

export const errorNotification = {
    title: "",
    message: "",
    type: "danger",
    insert: "top",
    container: "top-full",
    animationIn: ["animate__animated", "animate__fadeIn"],
    animationOut: ["animate__animated", "animate__fadeOut"],
    dismiss: {
      duration: 15000,
      onScreen: true
    }
}

export const toaster = (title, message, notification) => {
  if (!Store?.addNotification) {
    console.error('Notification store not initialized.');
    return;
  }
    Store.addNotification({
        ...notification,
        title: title,
        message: message,
    })
}