You own your conversations on this platform.  You decide who reads and hears them.  You can give or sell access to them, and that access can be view or edit.

If you sell access through the platform to another user, the platform owner gets a percentage of the sale.  The advantage here is that the transaction is safe, escrowed, and guaranteed.  The selling point is that outside the platform, the buyer has no guarantee that the file is what the seller says it is, but inside the platform, this can be verified.  Also, inside the platform, the buyer can form a relationship with the creator, which could potentially lead to access to exclusive content.

For maximum security and trust, it would make sense to eventually migrate the platform to web3 for seamless integration with a distributed ledger.  Here, the conversation will be an NFT.  This way, different sections of the same conversation can be owned by different users, access can be subcontracted from subscriber to subscriber (according to the conversation's underlying smart contract)

When POSTed with an owner's private key and conversation ID, `/conversation` returns:
- audio recording 
  - URI
- text
  - URI
- list of owners (must reach consensus for access sale).  Default is the caller (and ultimately the receiver when Vent/Ventsure integration occurs)
- list of subscribers

When POSTed with a subscriber's private key and conversation ID, `/conversation/[conversationId]` returns:
- audio recording
  - URI
- text
  - URI
 
 But initially, to implement this for MVP, let's just create a basic web client:
 - React app
 - Firebase authentication, including 2FA using text message sent to the user's phone number
 - Once the user is logged in, they can access a `/calls` page which lists each of their calls with:
   - URI for audio
   - URI for text
   - Delete button