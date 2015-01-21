# rennet
Rennet is a JSON document database that enables branching, chaining and merging of documents based on a simple rules pipeline. This allows you to read data that is transformed dependent on the current context of the application. Let's call this "context-aware data".

A clean separation of metadata and code is a key enabler for rapid development on teams. It enables developers to continuously ship code and limits the impact of bugs. With context-aware data provided by something like rennet, developers can ship code, enable QA to test it, expose it to subsets of users/environments, and can place ultimate control of the product in the hands of the product owner.

In video games this is very common practice, with data files defining everything about the game. Nowadays game data is modified on the fly in production over the internet, and integrated with A/B testing, in order to increase key performance indicators. It is less common in web or app development, but just as useful. At [RealCrowd](https://www.realcrowd.com) we use this primarily to simplify parallel development and continuous integration, with developers committing to the master branch and deploying to production often with limited impact on the end user.

Some especially useful areas for context-aware data:

1. Environment and user-based configuration of features
2. Authorization
3. A/B testing
4. Dynamic configuration in general
5. Localization

Rennet is currently an api-only system, but we have plans to build a management UI for it. By default it starts up with in-process ephemeral storage. This makes development and testing fast, but is not usable in production. A [Redis](http://redis.io/) as well as an [Azure DocumentDb](http://azure.microsoft.com/en-us/services/documentdb/) storage provider are included for persistent storage of documents. Data storage is abstracted into what we call [Providers](https://github.com/realcrowd/rennet/tree/master/providers) so new storage options are easy to create.

## Usage
Imagine you have an application called "GitHub" that enables collaboration around git repositories. You want to both make some money and encourage open source development, so you decide to charge users for the ability to host private repositories. You want to set different pricing tiers and offer a different number of private repositories at each tier. This is pretty easy to do in code or with any ole database. But, things get a bit more complex if, say, you want to A/B test the number of tiers, or only roll it out to a percentage of your user base, or have different settings for the QA environment. The code for these scenarios can turn to spaghetti very quickly.

With this configuration example, rennet will toggle the configuration for the private repositories feature in different deployment environments and for users with different pricing tiers in production. This creates a nice separation of concerns as the GitHub application no longer needs to have code for _why_ a given feature is on or off in the current context, just that it is.

Check out the demo script in the [tests](https://github.com/realcrowd/rennet/tree/master/tests) directory if you want to run this entire usage example from one script. Curl is required to be in the path and rennet must be running locally on port 1337 for the script to run.

### Create a Repository
This creates an empty repository with an ID of "github". You can store any other data you'd like on this document, but id is required. Later we'll add some branches into this repository to start exposing transformed data.

```
curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"github\"}" http://localhost:1337/api/v1/repository/github
```

### Add Patches to Repository
All documents stored in the database are patches. Patches are ultimately grouped together in branches, and applied in the order specified in the branch. Each patch also has a rule that determines if it will be applied in the current context.

Let's create a few patches. We'll max out the "privateRepository" feature in the QA environment, set it to 0 by default in production, and set the correct value for users in the paid plans.

For this we'll use the [StringMatchesRule](https://github.com/realcrowd/rennet/blob/master/models/rules/StringMatchesRule.js) to determine the plan that the user is a part of and apply the correct patch to the features data. See the [rules directory](https://github.com/realcrowd/rennet/tree/master/models/rules) for a list of the supported rules.

```
curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"defaultFeatures\",\"data\":{\"features\":{\"privateRepository\":0}}}" http://localhost:1337/api/v1/repository/github/patch/defaultFeatures

curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"microFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"micro\"}},\"data\":{\"features\":{\"privateRepository\":5}}}" http://localhost:1337/api/v1/repository/github/patch/microFeatures

curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"smallFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"small\"}},\"data\":{\"features\":{\"privateRepository\":10}}}" http://localhost:1337/api/v1/repository/github/patch/smallFeatures

curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"mediumFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"medium\"}},\"data\":{\"features\":{\"privateRepository\":20}}}" http://localhost:1337/api/v1/repository/github/patch/mediumFeatures

curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"largeFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"large\"}},\"data\":{\"features\":{\"privateRepository\":50}}}" http://localhost:1337/api/v1/repository/github/patch/largeFeatures

curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"testingFeatures\",\"data\":{\"features\":{\"privateRepository\":1000}}}" http://localhost:1337/api/v1/repository/github/patch/testingFeatures
```

### Create Branches with Patches
Now we'll update the repository index to define a few branches and put the patches we created to use. We define a "master" branch that holds the default configuration for the application. We define a "qa" branch which contains all the patches from the "master" branch, but also applies the "testingFeatures" patch. We also define a "prod" branch that contains the "master" patches and all the patches with rules based on the user's plan.

In a typical application the qa and prod environments will have much different configurations with various features being in different states of testing, different percentage of the user base with the feature enabled, etc.

```
curl -X PUT -H "Content-Type: application/json" -d "{\"id\":\"github\",\"branches\":{\"master\":{\"patches\":[\"defaultFeatures\"]},\"qa\":{\"patches\":[\"branch:master\",\"testingFeatures\"]},\"prod\":{\"patches\":[\"branch:master\",\"microFeatures\",\"smallFeatures\",\"mediumFeatures\",\"largeFeatures\"]}}}" http://localhost:1337/api/v1/repository/github
```

### Apply a Branch to a Context
Now we can use all this data we stored. POST to the repository and branch you want to use with your application's context. In this case we're just including the expected "user.plan" object that is used in the patch rules. You might also include user id, user roles, a/b test group id, data center id, operating system type, computer name, etc to further vary the data.

Notice we also include a "data" node in the context. The patches apply directly to the context at the node that is specified in the [patch](https://github.com/realcrowd/rennet/blob/master/models/Patch.js). The default location is "$.data", but you can change that in the patch. We use the [JSONPath package](https://www.npmjs.org/package/JSONPath) for locating where in the document hierarchy to apply patches and evaluate rules.

```
curl -X POST -H "Content-Type: application/json" -d "{\"user\":{\"plan\":\"free\"},\"data\":{}}" http://localhost:1337/api/v1/repository/github/branch/qa/context

curl -X POST -H "Content-Type: application/json" -d "{\"user\":{\"plan\":\"free\"},\"data\":{}}" http://localhost:1337/api/v1/repository/github/branch/prod/context

curl -X POST -H "Content-Type: application/json" -d "{\"user\":{\"plan\":\"medium\"},\"data\":{}}" http://localhost:1337/api/v1/repository/github/branch/prod/context
```

## How to run me

```
git clone https://github.com/realcrowd/rennet.git

cd rennet

npm install -g bower

npm install

bower install

node http.js
```

## Contributing
See our [Contributing](https://github.com/realcrowd/rennet/blob/master/CONTRIBUTING.md) doc for details on contributing. Just do it.

## TODO
* Setup 'npm test'
* DELETE support
* Etag support (etag, if-match, if-none-match) for optimistic concurrency control
* Logging
* Performance monitoring
* Load testing
* Caching providers
* User interface for managing patches and rules
* More rules. i.e. multi rule, number comparison `>, <, >=, <=, ==, %`, user-defined script, ?
* MongoDB, filesystem, other document storage options (what do you want?)
* Client libraries
* JSON error formatting
* Authentication/Authorization
* Refactor services to remove some boilerplate