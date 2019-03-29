import React from "react";
import App, { Container } from "next/app";
import Head from "next/head";
import { StylesProvider, ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import getPageContext, { PageContext } from "../src/getPageContext";
import io from "socket.io-client";

export type AppState = {
  foo: string;
  socket: io.socket;
};

class MyApp extends App {
  state = {
    foo: "Hello, World!",
    socket: null
  };

  constructor() {
    // @ts-ignore
    super();
    this.pageContext = getPageContext();
  }

  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }

    const socket = io(`http://localhost:${process.env.SOCKETIO_PORT || 3001}`);
    this.setState({ socket });
  }

  componentWillUnmount() {
    console.log("Unmounting and closing socket");
    this.state.socket.close();
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <Head>
          <title>My page</title>
        </Head>
        {/* Wrap every page in Styles and Theme providers */}
        <StylesProvider
          //generateClassName={this.pageContext.generateClassName}
          sheetsRegistry={this.pageContext.sheetsRegistry}
          sheetsManager={this.pageContext.sheetsManager}
        >
          {/* ThemeProvider makes the theme available down the React
              tree thanks to React context. */}
          <ThemeProvider theme={this.pageContext.theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {/* Pass pageContext to the _document though the renderPage enhancer
                to render collected styles on server side. */}
            <Component
              pageContext={this.pageContext}
              {...pageProps}
              foo={this.state.foo}
              socket={this.state.socket}
            />
          </ThemeProvider>
        </StylesProvider>
      </Container>
    );
  }

  private pageContext: PageContext;
}

export default MyApp;