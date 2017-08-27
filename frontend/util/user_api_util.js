export const fetchUsers = () => {
  return $.ajax({
    method: 'GET',
    url: 'api/users'
  });
};

// export const createFollow = id => {
//   return $.ajax({
//     method: 'POST',
//     url: `api`
//   });
// };
