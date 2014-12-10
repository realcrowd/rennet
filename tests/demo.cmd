::Create repo
curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"github\"}" http://localhost:1337/api/v1/repository/github

::Create patches in repo
curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"defaultFeatures\",\"data\":{\"features\":{\"privateRepository\":0}}}" http://localhost:1337/api/v1/repository/github/patch/defaultFeatures
curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"microFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"micro\"}},\"data\":{\"features\":{\"privateRepository\":5}}}" http://localhost:1337/api/v1/repository/github/patch/microFeatures
curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"smallFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"small\"}},\"data\":{\"features\":{\"privateRepository\":10}}}" http://localhost:1337/api/v1/repository/github/patch/smallFeatures
curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"mediumFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"medium\"}},\"data\":{\"features\":{\"privateRepository\":20}}}" http://localhost:1337/api/v1/repository/github/patch/mediumFeatures
curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"largeFeatures\",\"rule\":{\"name\":\"StringMatchesRule\",\"arguments\":{\"jsonPath\":\"$.user.plan\",\"matches\":\"large\"}},\"data\":{\"features\":{\"privateRepository\":50}}}" http://localhost:1337/api/v1/repository/github/patch/largeFeatures
curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"testingFeatures\",\"data\":{\"features\":{\"privateRepository\":1000}}}" http://localhost:1337/api/v1/repository/github/patch/testingFeatures

::Modify repo to define branches
curl -X PUT -H "Content-Type: application/json" -d "{\"id\":\"github\",\"branches\":{\"master\":{\"patches\":[\"defaultFeatures\"]},\"qa\":{\"patches\":[\"branch:master\",\"testingFeatures\"]},\"prod\":{\"patches\":[\"branch:master\",\"microFeatures\",\"smallFeatures\",\"mediumFeatures\",\"largeFeatures\"]}}}" http://localhost:1337/api/v1/repository/github

::Use various repo branches with different contexts
curl -X POST -H "Content-Type: application/json" -d "{\"user\":{\"plan\":\"free\"},\"data\":{}}" http://localhost:1337/api/v1/repository/github/branch/qa/context
curl -X POST -H "Content-Type: application/json" -d "{\"user\":{\"plan\":\"free\"},\"data\":{}}" http://localhost:1337/api/v1/repository/github/branch/prod/context
curl -X POST -H "Content-Type: application/json" -d "{\"user\":{\"plan\":\"medium\"},\"data\":{}}" http://localhost:1337/api/v1/repository/github/branch/prod/context