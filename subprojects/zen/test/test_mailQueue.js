import { mailQueue } from "../src/system/integration/mailQueue.js";

process.env.token = "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJjZjQ2OTIyNS1jMmE2LTRiNDItYmViZS1lYzI0MmRhY2EzZWMiLCJzdWIiOiJzdXBwb3J0QHBlcnNvbmFsc29mdC5jb20uYnIiLCJuYmYiOjE3Njc2ODE0MDAsImlhdCI6MTc2NzY4MTQwMCwiZXhwIjoxNzY3NzY3ODAwLCJsb2NhbGUiOiJwdC1CUiIsInRpbWVab25lIjoiQW1lcmljYS9TYW9fUGF1bG8ifQ.zujOw7vq29bpt3n3ELJcMUuyjHJsNwdS87i55QP1DHg";

await mailQueue({
    "method": "POST",
    "path": "/",
    "query": {
        "p1": "v1",
        "p2": "v2"
    },
    "headers": {
        "content-type": "application/json"
    },
    "body": {
        "context": {
            "tenant": "act",
            "event": "/module/operation",
            "token": "jwt",
            "tags": [
                "after",
                "before"
            ]
        },
        "args": {
            "id": 9999,
            "bean": {
                "id": 9999
            }
        },
        "result": {}
    }
});