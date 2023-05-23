import { Container, Title } from "@mantine/core";
import RequestCard from "./RequestCard/RequestCard";

// const mockRequests = [
//   {
//     id: "4a06f50a-e584-4bdc-9ea4-0d1a9e48e45d",
//     requestor: {
//       user_id: "d1810f13-0b3a-453a-a031-dfa070498887",
//       user_full_name: "Robin Raynard",
//       user_avatar:
//         "https://robohash.org/consequaturistesint.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "ccde60ce-b36d-4ec5-b079-bd1d68b8993e",
//       form_name: "Dr",
//       form_description:
//         "Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.\n\nNullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh.",
//     },
//     signers: [
//       {
//         user_id: "5c5566cc-6c3e-4668-97f8-6a485fddf60e",
//         user_full_name: "Terri-jo Netley",
//         user_avatar: "https://robohash.org/exsintnatus.png?size=50x50&set=set1",
//       },
//     ],
//     status: "PENDING",
//     date_created: "2012-05-28T20:23:51Z",
//     date_updated: "2006-03-08T17:37:43Z",
//   },
//   {
//     id: "c0acdcf8-3f0c-4593-acc7-844fc082b569",
//     requestor: {
//       user_id: "d3545e22-8ba0-4ea8-9340-11ff4b5016b0",
//       user_full_name: "Gwenni Gilleon",
//       user_avatar:
//         "https://robohash.org/facereveniamnihil.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "9ad1fe24-3ae0-4c33-9320-2fc9f17f2b53",
//       form_name: "Mrs",
//       form_description: "Sed ante. Vivamus tortor. Duis mattis egestas metus.",
//     },
//     signers: [
//       {
//         user_id: "d0823a12-15b1-4542-96f5-7cd938bfcffe",
//         user_full_name: "Renard Dowthwaite",
//         user_avatar:
//           "https://robohash.org/essevoluptatumenim.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "f667be22-e62d-458d-afb9-d74ebd7722d2",
//         user_full_name: "Noreen Olennikov",
//         user_avatar:
//           "https://robohash.org/reprehenderitmagnamtempore.png?size=50x50&set=set1",
//       },
//     ],
//     status: "APPROVED",
//     date_created: "2021-04-22T16:42:59Z",
//     date_updated: "2000-06-30T14:51:46Z",
//   },
//   {
//     id: "0b549978-0fe3-4057-94ea-0ecb87d286ef",
//     requestor: {
//       user_id: "cd1e3e6b-fa60-444d-980e-d915cf6500c1",
//       user_full_name: "Adrienne Arnaud",
//       user_avatar: "https://robohash.org/idoditomnis.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "4a717c9b-f1eb-4f3b-b826-5359bc90a18f",
//       form_name: "Rev",
//       form_description:
//         "Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.",
//     },
//     signers: [
//       {
//         user_id: "90789e68-9070-446a-b17b-ddb05ef37ce7",
//         user_full_name: "Nancey Bode",
//         user_avatar:
//           "https://robohash.org/omnisipsamdoloremque.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "286a35e4-d043-481e-920a-0108acca92e3",
//         user_full_name: "Carmelita Cramp",
//         user_avatar:
//           "https://robohash.org/autnullaconsequatur.png?size=50x50&set=set1",
//       },
//     ],
//     status: "APPROVED",
//     date_created: "2023-05-18T21:09:14Z",
//     date_updated: "2023-03-02T11:11:17Z",
//   },
//   {
//     id: "71d47d1a-f229-4123-a4b7-bd4e76f09e6c",
//     requestor: {
//       user_id: "906dca7d-c840-43c6-b662-2213a2c62efb",
//       user_full_name: "Dionisio Iannello",
//       user_avatar:
//         "https://robohash.org/dolorcumqueoccaecati.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "c96005c9-5af5-4977-96aa-0445c6461d5d",
//       form_name: "Ms",
//       form_description:
//         "Curabitur gravida nisi at nibh. In hac habitasse platea dictumst. Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem.",
//     },
//     signers: [
//       {
//         user_id: "e688c008-7794-4a99-a41b-71b469b56415",
//         user_full_name: "Conny Ricardou",
//         user_avatar:
//           "https://robohash.org/ducimusharumquas.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "08f55e3d-60b1-4e05-88db-436e545da59a",
//         user_full_name: "Phillipp Rowly",
//         user_avatar:
//           "https://robohash.org/magnamaliquamadipisci.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "046d41f7-0de6-435a-9d7c-a919a22d8a2d",
//         user_full_name: "Basia Romans",
//         user_avatar:
//           "https://robohash.org/voluptasestplaceat.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "9e4998fa-ed97-442a-99f3-38099c64e933",
//         user_full_name: "Brannon Guichard",
//         user_avatar: "https://robohash.org/aututqui.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "92463960-9540-4312-ab0a-882ce4fcd6c9",
//         user_full_name: "Prudy Morch",
//         user_avatar:
//           "https://robohash.org/mollitiarepellatest.png?size=50x50&set=set1",
//       },
//     ],
//     status: "APPROVED",
//     date_created: "2019-07-12T22:11:41Z",
//     date_updated: "2022-09-06T12:04:08Z",
//   },
//   {
//     id: "3a6dcd7d-72b7-4c28-bc5b-58d0c76c5a6f",
//     requestor: {
//       user_id: "b98c3d67-bdfc-474c-95b7-f0f1051a14a8",
//       user_full_name: "Beltran Hannant",
//       user_avatar: "https://robohash.org/eanisiducimus.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "5c8b5cfd-26cf-4548-9803-c7d3ca311ed3",
//       form_name: "Rev",
//       form_description: "In congue. Etiam justo. Etiam pretium iaculis justo.",
//     },
//     signers: [
//       {
//         user_id: "be5e9d52-7e74-465f-a703-6d2f69ba470e",
//         user_full_name: "Leyla Reisk",
//         user_avatar:
//           "https://robohash.org/voluptatibusmollitiasaepe.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "bbf9d502-bf9a-4b79-b344-0bb1bba977f2",
//         user_full_name: "Tamara Renol",
//         user_avatar:
//           "https://robohash.org/namlaboriosamdebitis.png?size=50x50&set=set1",
//       },
//     ],
//     status: "APPROVED",
//     date_created: "2020-03-27T14:12:37Z",
//     date_updated: "2016-04-02T07:20:13Z",
//   },
//   {
//     id: "83f796a6-8571-4e0e-8432-d19f6069fcc5",
//     requestor: {
//       user_id: "2c1fa2d5-93e2-411f-878f-e367cab1744d",
//       user_full_name: "Cilka Leighfield",
//       user_avatar:
//         "https://robohash.org/nullaaccusantiumtotam.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "e0e73718-f22b-49ff-948d-9fae53a6b930",
//       form_name: "Mrs",
//       form_description:
//         "In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.\n\nSuspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.",
//     },
//     signers: [
//       {
//         user_id: "b06ed688-e648-4389-b8c8-acf1e9d2f9d5",
//         user_full_name: "Una Ellesmere",
//         user_avatar:
//           "https://robohash.org/isteetdolorum.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "689f354d-08d5-492a-ab28-a3397fe17eaf",
//         user_full_name: "Benedicta Wearne",
//         user_avatar: "https://robohash.org/etdoloreut.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "0dca0c9e-2102-44ed-8247-8e2bf3bfd9cb",
//         user_full_name: "Lind Liebrecht",
//         user_avatar:
//           "https://robohash.org/seddictavoluptas.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "de82730d-ffc3-41eb-ba1d-5c71ca5edd86",
//         user_full_name: "Isabella Gumey",
//         user_avatar:
//           "https://robohash.org/molestiaeinciduntcommodi.png?size=50x50&set=set1",
//       },
//     ],
//     status: "APPROVED",
//     date_created: "2009-05-05T15:08:08Z",
//     date_updated: "2013-05-12T04:15:38Z",
//   },
//   {
//     id: "dd83733e-5a3f-4908-adac-72b3d51f313c",
//     requestor: {
//       user_id: "670c1bc6-d758-43dd-8d31-7e0514927280",
//       user_full_name: "Ramon Iddon",
//       user_avatar:
//         "https://robohash.org/temporadelenitiet.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "e6ddeac0-a792-44a7-811d-5500754720db",
//       form_name: "Rev",
//       form_description:
//         "Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum.\n\nCurabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.\n\nPhasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.",
//     },
//     signers: [
//       {
//         user_id: "02a4e1de-d0b4-41a6-b478-ff13b33dc523",
//         user_full_name: "Leonerd Linnock",
//         user_avatar:
//           "https://robohash.org/quiaarchitectonulla.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "b2330baa-a7dc-4c3e-af21-487480216ca1",
//         user_full_name: "Sanderson O'Cleary",
//         user_avatar:
//           "https://robohash.org/sintrepudiandaererum.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "4d92bc2b-835d-48d5-a1e1-a0e299f49ef1",
//         user_full_name: "Steffane Wathall",
//         user_avatar:
//           "https://robohash.org/eligendimolestiaequas.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "c773b7d8-7098-4726-93b1-1924ebf3b7c2",
//         user_full_name: "Magdaia Sodeau",
//         user_avatar:
//           "https://robohash.org/quiaipsumhic.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "8ac99418-7163-4441-b841-3b51d92254b8",
//         user_full_name: "Judy Fochs",
//         user_avatar: "https://robohash.org/eaaliasest.png?size=50x50&set=set1",
//       },
//     ],
//     status: "APPROVED",
//     date_created: "2009-05-13T09:30:57Z",
//     date_updated: "2018-03-26T18:40:49Z",
//   },
//   {
//     id: "9ca40576-626e-4a8b-89ad-1301c318573c",
//     requestor: {
//       user_id: "bdbae638-3760-4839-8a20-ad5d5ef56ecc",
//       user_full_name: "Noni Laguerre",
//       user_avatar:
//         "https://robohash.org/asperioresvelrerum.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "dcb0122f-fbb5-4d75-a589-00ba2ee92252",
//       form_name: "Honorable",
//       form_description:
//         "Sed ante. Vivamus tortor. Duis mattis egestas metus.\n\nAenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.\n\nQuisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.",
//     },
//     signers: [
//       {
//         user_id: "28f2c3e6-dc2d-40de-9631-38f2d427dd83",
//         user_full_name: "Trueman Stuck",
//         user_avatar: "https://robohash.org/estaliasqui.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "e961c19e-b052-455f-9ee6-de5b441bdbb8",
//         user_full_name: "Sharleen Aykroyd",
//         user_avatar:
//           "https://robohash.org/nonlaudantiumquos.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "53e03cf4-a817-4a37-91b3-4dd6eb216c9c",
//         user_full_name: "Nessi Fullard",
//         user_avatar:
//           "https://robohash.org/dolorumexcepturimollitia.png?size=50x50&set=set1",
//       },
//     ],
//     status: "PENDING",
//     date_created: "2005-04-29T17:27:17Z",
//     date_updated: "2014-01-13T15:24:41Z",
//   },
//   {
//     id: "326631c9-74ab-4f40-ba0d-0def99213574",
//     requestor: {
//       user_id: "f5532659-f3b4-4329-b24e-a65181233a43",
//       user_full_name: "Jeniffer MacGilpatrick",
//       user_avatar:
//         "https://robohash.org/voluptatesquaeaut.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "f90a847a-087b-4c62-b101-c81a0daeb58c",
//       form_name: "Dr",
//       form_description:
//         "Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.",
//     },
//     signers: [
//       {
//         user_id: "cb4048c4-829d-4c07-90d5-b833440a09f4",
//         user_full_name: "Merline Casotti",
//         user_avatar:
//           "https://robohash.org/recusandaedebitisnecessitatibus.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "cfc2be63-a141-4611-8f75-d44cf26707e8",
//         user_full_name: "Seline Lewing",
//         user_avatar:
//           "https://robohash.org/illodoloremqueenim.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "16555781-2d50-4c7f-9936-cc00c69bd90a",
//         user_full_name: "Paola Persicke",
//         user_avatar:
//           "https://robohash.org/voluptatesdolorumdignissimos.png?size=50x50&set=set1",
//       },
//     ],
//     status: "PENDING",
//     date_created: "2006-06-23T09:38:26Z",
//     date_updated: "2002-06-02T08:31:09Z",
//   },
//   {
//     id: "dfef29e3-7dd7-4401-99fe-4273b868da8b",
//     requestor: {
//       user_id: "c2b9427c-e78e-4e6c-ba22-d79c663eee45",
//       user_full_name: "Dallis Leimster",
//       user_avatar: "https://robohash.org/easintvero.png?size=50x50&set=set1",
//     },
//     form: {
//       form_id: "0e418f36-a71f-4553-9b0a-83fb87164c78",
//       form_name: "Ms",
//       form_description:
//         "Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat.",
//     },
//     signers: [
//       {
//         user_id: "78a96e08-7448-4953-94e7-ef49ab1be600",
//         user_full_name: "Ariel Fendlow",
//         user_avatar:
//           "https://robohash.org/voluptatedictaeveniet.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "8a42ac34-2eee-49d3-a02a-e03691b1a248",
//         user_full_name: "Lief Marguerite",
//         user_avatar:
//           "https://robohash.org/etquodofficiis.png?size=50x50&set=set1",
//       },
//       {
//         user_id: "06e0e1e5-653c-47ad-b3c3-19c56f3e35c9",
//         user_full_name: "Virgilio Lewing",
//         user_avatar:
//           "https://robohash.org/suscipitdelenitiut.png?size=50x50&set=set1",
//       },
//     ],
//     status: "PENDING",
//     date_created: "2022-08-05T18:52:05Z",
//     date_updated: "2015-04-15T19:43:20Z",
//   },
// ];

const RequestListPage = () => {
  return (
    <Container fluid>
      <Title>Request List Page</Title>
      <RequestCard />
    </Container>
  );
};

export default RequestListPage;
