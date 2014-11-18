# rennet

## Dev environment setup in Visual Studio / Windows
This project will run on other platforms, this is just how to get it going in Windows using Visual Studio as your IDE. We use npm and bower for packages.
1. Install Msysgit (http://msysgit.github.io/)
	- Make sure to choose the "Run Git from the Windows Command Prompt" option during setup, which will add Git to your path
2. Install node.js, Visual Studio 2013, and Node.js Tools for Visual Studio (https://nodejstools.codeplex.com/wikipage?title=Installation)
3. Open project, right click the npm node in solution explorer and choose "Install missing npm packages"
4. Open Node.js interactive window in Visual Studio (View -> Other Windows -> Node.js Interactive Window)
5. Install bower globally so it is available in your command prompt:
```
> .npm install -g bower
```
6. Open a command prompt in the project root (rennet/rennet) and install/restore bower packages
```
> bower install
```
