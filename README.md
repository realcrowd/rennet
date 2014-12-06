# rennet
Rennet is a JSON document database with git-like branching, chaining and merging of documents based on a simple rules pipeline. This enables reading data that is dependent on the current context of the application.

There are a few use cases where this system is valuable.

1. Environment and user-based configuration of features
2. Authorization
3. A/B testing
4. Dynamic configuration in general
5. Localization

Rennet is currently an api-only system. Data is stored in [Azure DocumentDb](http://azure.microsoft.com/en-us/services/documentdb/). A test account access key is provided for now, until someone abuses it. Data storage is abstracted into what we call [Providers](https://github.com/realcrowd/rennet/tree/master/providers) so new storage options are easy to create. We have an in process version that is used for the unit/system tests.

## Usage
We'll tackle use case 1 for this usage example.

Imagine you have an application called "GitHub" that enables collaboration around git repositories. With this configuration, rennet will toggle features in different deployment environments and for users with different pricing tiers in production. This creates a nice separation of concerns as the GitHub application no longer needs to have code for _why_ a given feature is on or off in the current context, just that it is.

Rennet's branches and patch rules enable non-developers to choose when patches are applied, and allows rules to change without redeploying code.

### Create a Repository
This creates an empty repository with an ID of "github". You can store any other data you'd like on this document, but id is required. Later we'll add some branches into this repository to start exposing transformed data.

```
> curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"github\"}" http://localhost:1337/repository/github
```

### Add Patches to Repository
All documents stored in the database are patches. Patches are ultimately grouped together in branches, and applied in the order specified in the branch. Each patch also has a rule that determines if it will be applied in the current context.

Let's create a few patches. We'll max out the "privateRepository" feature in the QA environment, set it to 0 by default in production, and set the correct value for users in the paid plans.

For this we'll use the [StringMatchesRule](https://github.com/realcrowd/rennet/blob/master/models/rules/StringMatchesRule.js) to determine the plan that the user is a part of and apply the correct patch to the features data. See the [rules directory](https://github.com/realcrowd/rennet/tree/master/models/rules) for a list of the supported rules.

```
> curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"defaultFeatures\",\"data\":{\"features\":{\"privateRepository\":0}}}" http://localhost:1337/repository/github/patch/defaultFeatures

> curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"microFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"micro\"}},\"data\":{\"features\":{\"privateRepository\":5}}}" http://localhost:1337/repository/github/patch/microFeatures

> curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"smallFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"small\"}},\"data\":{\"features\":{\"privateRepository\":10}}}" http://localhost:1337/repository/github/patch/smallFeatures

> curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"mediumFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"medium\"}},\"data\":{\"features\":{\"privateRepository\":20}}}" http://localhost:1337/repository/github/patch/mediumFeatures

> curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"largeFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"large\"}},\"data\":{\"features\":{\"privateRepository\":50}}}" http://localhost:1337/repository/github/patch/largeFeatures

> curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"testingFeatures\",\"data\":{\"features\":{\"privateRepository\":1000}}}" http://localhost:1337/repository/github/patch/testingFeatures

```

### Create Branches with Patches
Now we'll update the repository index to define a few branches and put the patches we created to use. We define a "master" branch that holds the default configuration for the application. We define a "qa" branch which contains all the patches from the "master" branch, but also applies the "testingFeatures" patch. We also define a "prod" branch that just contains the "master" patches. In a typical application the qa and prod environments will have much different configurations with various features being in different states of testing, different % of the user base with the feature enabled, etc.

```
> curl -X PUT -H "Content-Type: application/json" -d "{\"id\":\"github\",\"branches\":\"master\":{\"patches\":[\"defaultFeatures\",\"microFeatures\",\"smallFeatures\",\"mediumFeatures\",\"largeFeatures\"]},\"qa\":{\"patches\":[\"branch:master\",\"testingFeatures\"]},\"prod\":{\"patches\":[\"branch:master\"]}}" http://localhost:1337/repository/github

```

### Apply Branch and Patches to a Context
Now we can use all this data we stored. POST to the repository and branch you want with your application's context. In this case we're just including the expected "user.plan" object that is used in the patch rules. You might also include user id, user roles, a/b test group id, data center id, operating system type, etc to further vary the data.

Notice we also include a "data" node in the context. The patches apply directly to the context at the node that is specified in the [patch](https://github.com/realcrowd/rennet/blob/master/models/Patch.js). The default location is "$.data", but you can change that in the patch. We use the [JSONPath package](https://www.npmjs.org/package/JSONPath) for locating where in the document hierarchy to apply patches and evaluate rules.

```
> curl -X POST -H "Content-Type: application/json" -d "{\"user\":{\"plan\":\"free\"},\"data\":{}}" http://localhost:1337/repository/github/branch/qa/context

> curl -X POST -H "Content-Type: application/json" -d "{\"user\":{\"plan\":\"free\"},\"data\":{}}" http://localhost:1337/repository/github/branch/prod/context

> curl -X POST -H "Content-Type: application/json" -d "{\"user\":{\"plan\":\"medium\"},\"data\":{}}" http://localhost:1337/repository/github/branch/prod/context

```

## Generic dev environment setup

```
> git clone https://github.com/realcrowd/rennet.git

> cd rennet

> npm install -g bower

> npm install

> bower install

> node http.js
```

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
Mocha tests are in the "tests" directory. They should be run with environment variable NODE_ENV=test. TODO: setup 'npm test'. We currently run them from within WebStorm or Visual Studio.