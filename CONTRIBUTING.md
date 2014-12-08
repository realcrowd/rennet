# How to contribute
Feel free to fork and submit pull requests. File issues if you have them.

This project is maintained by JD Conley (jd@realcrowd.com). Contact him if you have any thoughts or questions.

## Dev environment setup in Visual Studio / Windows
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

## Running the tests
Mocha tests are in the "tests" directory. They should be run with environment variable NODE_ENV=test. We currently run them from within WebStorm or Visual Studio.
