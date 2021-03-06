import {
  getCheckedInPeople,
  getCheckedInPeopleByCompany,
} from '../../../shared/people';

describe('People unit tests', () => {
  context('#checkedInPeople', () => {
    it('should handle empty input', () => {
      expect(getCheckedInPeople()).to.eql([]);
    });

    it('should check in person', () => {
      expect(
        getCheckedInPeople([{ _id: 1, personId: 1, isCheckedIn: true }])
      ).to.eql([{ _id: 1, personId: 1, isCheckedIn: true }]);
    });

    it('should check out person', () => {
      expect(
        getCheckedInPeople([
          { _id: 1, personId: 1, isCheckedIn: true },
          { _id: 2, personId: 1, isCheckedIn: false },
        ])
      ).to.eql([]);
    });

    it('should check in person again', () => {
      expect(
        getCheckedInPeople([
          { _id: 1, personId: 1, isCheckedIn: true },
          { _id: 2, personId: 1, isCheckedIn: false },
          { _id: 3, personId: 1, isCheckedIn: true },
        ])
      ).to.eql([{ _id: 3, personId: 1, isCheckedIn: true }]);
    });

    it('should check in multiple person', () => {
      expect(
        getCheckedInPeople([
          { _id: 1, personId: 1, isCheckedIn: true },
          { _id: 3, personId: 2, isCheckedIn: true },
        ])
      ).to.eql([
        { _id: 1, personId: 1, isCheckedIn: true },
        { _id: 3, personId: 2, isCheckedIn: true },
      ]);
    });
  });

  context('#getCheckedInPeopleByCompany', () => {
    it('should handle empty input', () => {
      expect(
        getCheckedInPeopleByCompany([
          { _id: 1, personId: 1, companyName: 'test1' },
          { _id: 2, personId: 2, companyName: 'test2' },
          { _id: 3, personId: 3, companyName: 'test1' },
        ])
      ).to.eql([
        {
          companyName: 'test1',
          count: 2,
        },
        {
          companyName: 'test2',
          count: 1,
        },
      ]);
    });
  });
});
