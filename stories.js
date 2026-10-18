// Neighbors' stories, shown in the "In our neighbors' words" slideshow.
// Each one is paired with a photo from gallery.js.
//
// To add a story, copy one of the entries below. Use first name and last
// initial only, and only share words people agreed to have posted.
// "…" marks where a longer statement was shortened.

const STORIES = [
  { name: "Beth J.", quote: "This group has quite literally kept me alive. I ran out of medication and was about 48 hours out from heart failure. It cost me around $27.00. … I KNOW if I come in here and this community can't help me… then at the very least I'm not gonna be ridiculed for asking." },
  { name: "Melissa R.", quote: "We have five children and our lights were going to get shut off with this heat. We were scared to death we didn't know what to do and they came through and helped us. I'm so thankful for that." },
  { name: "Aimee C.", quote: "We have had a rough couple of years and honestly I don't think we would even still have our home if it wasn't for help from the community here. A micro grant to help with gas to get to work and even a little bit of help towards rent and food from the pantries has always been appreciated and a blessing." },
  { name: "Joseph G.", quote: "We were living off of bread and beans most nights and then I reached out for help and I was so nervous because I had never done it before and they bought my family groceries for about a month and being a part of this community is truly amazing." },
  { name: "Davina V.", quote: "I was severely depressed when I joined this group. I had lost hope in humanity. It very quickly changed the way I saw the people around me. … This group provided informational resources that ultimately helped my family member receive life-saving medication." },
  { name: "Tiffany S.", quote: "It's easier to make good decisions on a full belly. It's easier to cook for your family if you aren't worried about your lights being cut off. … You're really out here changing LIVES and generations to come will benefit from the kindness found here." },
  { name: "Jean D.", quote: "I have tried to get help with getting water for over 2 years from government resources and all I get are phone numbers to call someone else. It's a challenge and you get nowhere. This group still gives people hope." },
  { name: "Hannah W.", quote: "This group has helped us out numerous times when we were down in the dirt and didn't have any food, I didn't know where the power and rent money was coming from and someone bought us groceries. … It has become a huge blessing to my little family." },
  { name: "Desrea M.", quote: "My husband had run out of ostomy supplies and I made a desperate plea here and had many people reach out and offer some they had from family members. It was so relieving. … They are a safe space in a community that oftentimes doesn't have enough resources to spare." },
  { name: "Eve M.", quote: "I managed to find a free fridge after mine died and I lost everything in it. Community is everything, and this group is the epitome of community. You give what you can, ask for what you need." },
  { name: "Sheree R.", quote: "I love to be able to give to this program because I know they help real people in real life stories that are in need! If not for this program a couple of times I needed a meal or baby formula I've been able to get help!" },
  { name: "Ashley B.", quote: "One day I had a nice man come and get my keys out of my locked car for free. It saved me money I didn't have and I was so grateful for my community and this nonprofit!" },
  { name: "Jessie K.", quote: "I've been able to donate my son's outgrown toys and clothes to several moms in the neighborhood. This past time, he was able to meet the little boy who was going to receive all his old stuff. It was very joyful and I was happy to see my son enjoying that opportunity to give!" },
  { name: "Chenoa D.", quote: "So many truly are in need and hear it all the time that reaching out at other places can bring judgment and hate. So having a place like this where it is kept polite and helpful is a miracle to a lot." },
  { name: "Alexis W.", quote: "It's the first place I come to and know I can depend on if life gets turned upside down. You guys are amazing and I can't wait to see the many things you'll continue to do for the community." },
  { name: "Laur L.", quote: "This group has been a blessing for me and my little family. We struggle due to health reasons and financial responsibilities beyond our control. I'm beyond grateful for these kind people." },
  { name: "Carla P.", quote: "When I was going through a difficult time and needed help, many people in this community showed me kindness, support, and encouragement. … Their generosity and compassion reminded me that I was not alone." },
  { name: "Tempestt S.", quote: "This group is the first resource I turn to and also tell others about. … Community is what you make it and this community is a family and I love it." },
  { name: "Heather F.", quote: "This community has saved me from not eating more than a couple of times. It's such a blessing to so many." },
  { name: "Pam R.", quote: "I have helped with the Blythe Avenue box before and felt blessed to be able to at the time, and I have no doubt I would get the same help back from my community." },
  { name: "Ed B.", quote: "Have given and received a bunch of times, and most importantly met some great people." },
  { name: "Mel S.", quote: "This group has aided me and my family in assisting the unhoused. Thank you!" },
  { name: "Michele L.", quote: "This group has given so much grace, I'm humbled and full of gratitude." },
  { name: "Cailean R.", quote: "This group is a life saver and has helped me so many times." },
  { name: "Jessica S.", quote: "Forever grateful for all the help given to my family. ❤️" },
  { name: "Deborah M.", quote: "I am thankful." },
];
